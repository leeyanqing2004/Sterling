const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const express = require("express");
const router = express.Router();
const clearanceRequired = require('../middleware/clearance');
const { lte } = require('zod/v4');

// TODO: make sure that when a cashier is set as suspicious, we also call the route that sets transactions to suspicious
// TODO: you can remove the Transactions[] field in Event model -> we don't need to store the transactions that occur for an event
// TODO: when testing, i removed Promotions[] from User

// TODO: test the events/transaction

//router.get('/users', clearanceRequired('regular'), (req, res) => {
    //      ...
    // }

// helper function to check clearance levels, outside of middleware
function roleInClearance(role, clearanceRequired) {
    const clearanceLevelsByIndex = ['regular', 'cashier', 'manager', 'superuser']

    if (!role) {
        return false;
    }

    const curRoleLevel = clearanceLevelsByIndex.indexOf(role)
    const requiredLevel = clearanceLevelsByIndex.indexOf(clearanceRequired)
        
    if (curRoleLevel < 0 || requiredLevel < 0) {
        return false;
    }

    return curRoleLevel >= requiredLevel;
};

// helper function to check the types of values in payload
function checkTypes(values, types, isRequired) {
    return values.every((value, index) => {
        if (!isRequired[index] && (value === undefined || value === null)) {
            return true;
        }
        if (types[index] === 'array') {
            return Array.isArray(value);
        }
        return typeof value === types[index];
    });
}

// helper function for creating promotionIds
function createPromotionIdsList(transaction) {
    if (transaction.promotions && transaction.promotions.length > 0) {
        return transaction.promotions.map(p => p.promotionId);
    }
    return null;
}

// how promotions work:
// - promotion.type = "automatic" or "one-time" => if automatic, no need to store in promotionIds
// - promotion.startTime = when it starts
// - promotion.endTime = when it ends
// - promotion.minSpending = min. spending needed, must be positive
// - rate = 0.01 => for every dollar spent, 1 extra point is added
// - points = points added to purchase transaction, must be positive

// helper function to determine if any promotions given are invalid
// ways they can be invalid:
// - nowDate < promotion.startTime
// - nowDate >= promotion.endTime
// - spent < promotion.minSpending
async function promotionsValid(spent, promotionIds) {
    const promotions = await prisma.promotion.findMany({
        where: {
            id: { in: promotionIds }
        }
    });

    const nowDate = new Date();

    for (const promotion of promotions) {
        if (nowDate < promotion.startTime || nowDate >= promotion.endTime || spent < promotion.minSpending) {
            return false
        }
    };

    return true
}

// helper function to calculate purchaseTransaction points earned
async function purchaseEarned(spent, promotionIds) {

    const promotions = await prisma.promotion.findMany({
        where: {
            id: { in: promotionIds }
        }
    });

    let finalEarned = 0;

    const defaultEarned = Math.floor(spent / 0.25);
    let extraEarned = 0;

    for (const promotion of promotions) {
        // if (promotion.type == 'automatic') {
        //     extraEarned += Math.floor(spent / promotion.rate);
        //     extraEarned += promotion.points;
        // }
        extraEarned += Math.floor(spent * (promotion.rate / 0.01));
        extraEarned += promotion.points;
    }
    finalEarned = defaultEarned + extraEarned;
    return finalEarned;
}

router.all("/", async (req, res) => {
    if (req.method !== "POST" && req.method !== "GET") {
        return res.status(405).send({error: "Method Not Allowed"});
    }

    const role = req.auth.role

    const userId = req.auth.id
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    if (!role) {
        return res.status(401).json({error: 'Unauthorized'})
    }
    if (!user) {
        return res.status(401).json({error: 'Unauthorized'})
    }

    const keys = Object.keys(req.body);

    if (req.method === "POST") {

        const { type } = req.body

        if (!type) {
            return res.status(400).json({ error: "No type specified." });
        }

        if (type !== "purchase" && type !== "adjustment") {
            return res.status(400).json({ error: "Bad Request: POST can only be completed for purchase/adjustment types." });
        }

        if (type === "purchase") {

            const allowedKeys = ['utorid', 'type', 'spent', 'promotionIds', 'remark'];
            const unknownKeys = keys.filter(key => !allowedKeys.includes(key));
            if (unknownKeys.length > 0) {
                return res.status(400).json({ error: `Unknown field(s): ${unknownKeys.join(', ')}` });
            }

            const { utorid, spent, promotionIds , remark } = req.body;

            if (!checkTypes([utorid, spent, promotionIds, remark], 
                        ['string', 'number', 'array', 'string'],
                        [true, true, false, false])) {
                            return res.status(400).json({ error: "Faulty payload field type." });
            }
            
            if (!roleInClearance(role, 'cashier')) {
                return res.status(403).json({error: 'Forbidden'})
            }

            const customerUser = await prisma.user.findUnique({
                where: {
                    utorid: utorid
                }
            });
    
            if (!customerUser) {
                return res.status(404).json({ error: "Customer of Purchase not Found" });
            }

            if (spent < 0) {
                return res.status(400).json({ error: "Spent value must be positive" });
            }

            if (promotionIds && promotionIds.length > 0) {
                const promotions = await prisma.promotion.findMany({
                    where: {
                        id: { in: promotionIds }
                    }
                });
            
                if (promotions.length !== promotionIds.length) {
                    return res.status(404).json({ error: "One or more promotionIds not found" });
                }

                const promotionIsValid = await promotionsValid(spent, promotionIds);

                if (!promotionIsValid) {
                    return res.status(400).json({ error: "One or more promotions are not valid for this transaction" });
                }
            }

            const promotions = await prisma.promotion.findMany({
                where: {
                    id: { in: promotionIds }
                }
            });

            const storedPromotionIds = [];

            for (const promotion of promotions) {
                if (promotion.type === 'one-time') {
                    storedPromotionIds.push(promotion.id)
                }
            }

            let earned = 0;
            let suspicious = false;

            if (role == 'cashier' && user.suspicious) {
                earned = 0;
                suspicious = true;
            } else {
                earned = await purchaseEarned(spent, promotionIds);
            }
            const amount = await purchaseEarned(spent, promotionIds);

            const newPurchase = await prisma.transaction.create({
                data: {
                    utorid: utorid,
                    type: type,
                    spent: spent,
                    createdBy: {
                        connect: { id: userId }
                    },
                    remark: remark ?? "",
                    suspicious: suspicious,
                    earned: earned,
                    recipient: {
                        connect: { id: customerUser.id }
                    },
                    amount: amount,
                    promotions: storedPromotionIds?.length
                        ? {
                          create: storedPromotionIds.map((storedPromotionIds) => ({
                            promotion: { connect: { id: storedPromotionIds } }
                          }))
                        }
                        : undefined
                },
                include: {
                    promotions: {
                        select: { promotionId: true }
                    },
                    createdBy: {
                        select: { utorid: true }
                    }
                }
            })

            await prisma.user.update({
                where: {
                    utorid: utorid
                },
                data: {
                    points: customerUser.points + earned
                }
            })

            return res.status(201).json({
                id: newPurchase.id,
                utorid: newPurchase.utorid,
                type: newPurchase.type,
                spent: newPurchase.spent,
                earned: newPurchase.earned,
                remark: newPurchase.remark,
                promotionIds: newPurchase.promotions.map(p => p.promotionId),
                createdBy: newPurchase.createdBy.utorid,
            });
        }

        if (type === "adjustment") {

            const allowedKeys = ['utorid', 'type', 'amount', 'relatedId', 'promotionIds', 'remark'];
            const unknownKeys = keys.filter(key => !allowedKeys.includes(key));
            if (unknownKeys.length > 0) {
                return res.status(400).json({ error: `Unknown field(s): ${unknownKeys.join(', ')}` });
            }

            const { utorid, type, amount, relatedId, promotionIds, remark } = req.body;

            if (!checkTypes([utorid, type, amount, relatedId, promotionIds, remark], 
                            ['string', 'string', 'number', 'number', 'array', 'string'],
                            [true, true, true, true, false, false])) {
                            return res.status(400).json({ error: "Faulty payload field type." });
            }
            
            if (!roleInClearance(role, 'manager')) {
                return res.status(403).json({error: 'Forbidden'})
            }
            const customerUser = await prisma.user.findUnique({
                where: {
                    utorid: utorid
                }
            });
            if (!customerUser) {
                return res.status(404).json({ error: "User of Adjustment Transaction not Found" });
            }

            const relatedTransaction = await prisma.transaction.findUnique({
                where: { id: parseInt(relatedId) },
                include: { recipient: true },
            });
            if (!relatedTransaction) {
                return res.status(404).json({ error: "Related Transaction not Found" });
            }

            if (promotionIds && promotionIds.length > 0) {
                const promotions = await prisma.promotion.findMany({
                    where: {
                        id: { in: promotionIds }
                    }
                });
                if (promotions.length !== promotionIds.length) {
                    return res.status(404).json({ error: "One or more promotionIds not found" });
                }
            }

            // in this case, we'll store all promotions, even if 'automatic'
            // since it is to store the promotions that we adjusted to a transaction

            const newAdjustment = await prisma.transaction.create({
                data: {
                    utorid: utorid,
                    type: type,
                    amount: amount,
                    relatedId: relatedId,
                    createdBy: {
                        connect: { id: userId }
                    },
                    remark: remark ?? "",
                    promotions: promotionIds?.length
                        ? {
                          create: promotionIds.map((promotionId) => ({
                            promotion: { connect: { id: promotionId } }
                          }))
                        }
                        : undefined
                },
                include: {
                    promotions: {
                        select: { promotionId: true }
                    },
                    createdBy: {
                        select: { utorid: true }
                    }
                }
            })

            // Now, actually adjust the related transaction

            const recipientId = relatedTransaction.recipient?.id;
            const recipientPoints = relatedTransaction.recipient?.points ?? 0;
            let pointDelta = 0;

            if (relatedTransaction.type === 'purchase') {
                const newAmount = relatedTransaction.amount + amount;
                const newEarned = relatedTransaction.earned + amount;
                if (!relatedTransaction.suspicious && recipientId) {
                    pointDelta = amount;
                }
                await prisma.transaction.update({
                    where: { id: parseInt(relatedId) },
                    data: {
                        amount: newAmount,
                        earned: newEarned,
                        promotions: promotionIds?.length
                            ? {
                                  create: promotionIds.map((promotionId) => ({
                                      promotion: { connect: { id: promotionId } }
                                  }))
                              }
                            : undefined
                    }
                });
            } else if (relatedTransaction.type === 'event') {
                const newAmount = relatedTransaction.amount + amount;
                pointDelta = amount;
                await prisma.transaction.update({
                    where: { id: parseInt(relatedId) },
                    data: {
                        amount: newAmount,
                        promotions: promotionIds?.length
                            ? {
                                  create: promotionIds.map((promotionId) => ({
                                      promotion: { connect: { id: promotionId } }
                                  }))
                              }
                            : undefined
                    }
                });
            } else { // TODO: IMPLEMENT FOR TRANSFER & REDEMPTION
                await prisma.transaction.update({
                    where: { id: parseInt(relatedId) },
                    data: {
                        promotions: promotionIds?.length
                            ? {
                                  create: promotionIds.map((promotionId) => ({
                                      promotion: { connect: { id: promotionId } }
                                  }))
                              }
                            : undefined
                    }
                });
            }

            // apply point delta after transaction adjustment
            if (recipientId && pointDelta !== 0) {
                await prisma.user.update({
                    where: { id: recipientId },
                    data: {
                        points: recipientPoints + pointDelta
                    }
                });
            }

            return res.status(201).json({
                id: newAdjustment.id,
                utorid: newAdjustment.utorid,
                amount: newAdjustment.amount,
                type: newAdjustment.type,
                relatedId: newAdjustment.relatedId,
                remark: newAdjustment.remark, 
                promotionIds: newAdjustment.promotions.map(p => p.promotionId),
                createdBy: newAdjustment.createdBy.utorid
            });
        }
    }
    if (req.method === "GET") {
        // Support filters from either query string (?page=1&limit=10...) or JSON body (legacy)
        const source = Object.keys(req.query).length ? req.query : req.body;
        const keys = Object.keys(source);

        const allowedKeys = ['name', 'createdBy', 'suspicious', 'promotionId', 'type', 'relatedId', 'amount', 'operator', 'page', 'limit'];
        const unknownKeys = keys.filter(key => !allowedKeys.includes(key));
        if (unknownKeys.length > 0) {
            return res.status(400).json({ error: `Unknown field(s): ${unknownKeys.join(', ')}` });
        }

        let { name, createdBy, suspicious , promotionId, type, relatedId, amount, operator, page, limit } = source;

        // Coerce primitive types from query-string values where necessary
        if (typeof suspicious === 'string') {
            // accept "true"/"false"
            suspicious = suspicious.toLowerCase() === 'true';
        }
        if (typeof promotionId === 'string') {
            promotionId = promotionId.length ? Number(promotionId) : undefined;
        }
        if (typeof relatedId === 'string') {
            relatedId = relatedId.length ? Number(relatedId) : undefined;
        }
        if (typeof amount === 'string') {
            amount = amount.length ? Number(amount) : undefined;
        }
        if (typeof page === 'string') {
            page = page.length ? Number(page) : undefined;
        }
        if (typeof limit === 'string') {
            limit = limit.length ? Number(limit) : undefined;
        }

        if (!checkTypes([name, createdBy, suspicious , promotionId, type, relatedId, amount, operator, page, limit], 
                    ['string', 'string', 'boolean', 'number', 'string', 'number', 'number', 'string', 'number', 'number'],
                    [false, false, false, false, false, false, false, false, false, false])) {
                        return res.status(400).json({ error: "Faulty payload field type." });
        }
        
        if (!roleInClearance(role, 'manager')) {
            return res.status(403).json({error: 'Forbidden'})
        }

        const where = {};

        if (name) {
            where.utorid = { contains: name };
        }

        if (createdBy) {
            where.createdBy = { utorid: createdBy };
        }

        if (suspicious) {
            where.suspicious = suspicious;
        }

        if (promotionId) {
            where.promotions = {
                some: {
                    promotionId: parseInt(promotionId)
                }
            };
        }

        if ((type) && !((type === 'purchase') || (type === 'adjustment') || (type === 'event') || (type === 'redemption') || (type === 'transfer'))) {
            return res.status(400).json({ error: "Invalid type filter." });
        }

        if (type) {
            where.type = type;
        }

        if (relatedId) {
            if (!type) {
                return res.status(400).json({ error: "RelatedId must be used with Type." });
            }
            where.relatedId = parseInt(relatedId);
        }

        if (amount || operator) {
            if (!(amount && operator)) {
                return res.status(400).json({ error: "Amount must be used with Operator." });
            }
            if ((operator !== 'gte') && (operator !== 'lte')) {
                return res.status(400).json({ error: "Operator must be 'gte' or 'lte'." });
            }
            where.amount = { [operator]: parseFloat(amount) };
        }

        if (!limit) {
            limit = 10;
        }

        if (!page) {
            page = 1;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);
        const [count, results] = await Promise.all([
            prisma.transaction.count({ where }),
            prisma.transaction.findMany({
                where,
                skip,
                take,
                orderBy: { id : 'asc' },
                select: {
                    id: true,
                    utorid: true,
                    amount: true,
                    type: true,
                    spent: true,
                    promotions: { select: { promotionId: true } },
                    suspicious: true, 
                    remark: true,
                    createdBy: { select: { utorid: true } },
                    relatedId: true, // do we need to exclude this if its undefined?
                    redeemed: true, // do we need to exclude this if its undefined?
                }
            })
        ]);
        
        for (const field of results) {
            field.promotionIds = field.promotions.map(p => p.promotionId);
            delete field.promotions;
            field.createdBy = field.createdBy.utorid;

            if (results.type === 'purchase') {
                delete results.relatedId;
                delete results.redeemed;
            }
            if ((results.type === 'adjustment') || (results.type === 'event') || (results.type === 'transfer')) {
                delete results.redeemed;
            }
            if (results.type === 'event') {
                results.eventId = results.relatedId;
            }
        }

        res.status(200).json({ count, results });
    }
});

router.all("/:transactionId", clearanceRequired('manager'), async (req, res) => {
    if (req.method !== "GET") {
        return res.status(405).send({error: "Method Not Allowed"});
    }
    const keys = Object.keys(req.body);
    const allowedKeys = [];
    const unknownKeys = keys.filter(key => !allowedKeys.includes(key));
    if (unknownKeys.length > 0) {
        return res.status(400).json({ error: `Unknown field(s): ${unknownKeys.join(', ')}` });
    }

    const transactionId = req.params.transactionId

    const transaction = await prisma.transaction.findUnique({where: { id: parseInt(transactionId) }})
    if (!transaction) {
        return res.status(404).send({ error: "Transaction not found" });
    }

    results = await prisma.transaction.findUnique({
        where : { id: parseInt(transactionId) },
        select: {
            id: true,
            utorid: true,
            type: true,
            spent: true,
            amount: true,
            promotions: { select: { promotionId: true } },
            suspicious: true, 
            remark: true,
            createdBy: { select: { utorid: true } },
            relatedId: true, // do we need to exclude this if its undefined?
            redeemed: true, // do we need to exclude this if its undefined?
        }
    });

    results.promotionIds = results.promotions.map(p => p.promotionId);
    delete results.promotions;
    results.createdBy = results.createdBy.utorid;

    if (results.type === 'purchase') {
        delete results.relatedId;
        delete results.redeemed;
    }
    if ((results.type === 'adjustment') || (results.type === 'event') || (results.type === 'transfer')) {
        delete results.redeemed;
    }
    if (results.type === 'event') {
        results.eventId = results.relatedId;
    }

    res.status(200).json(results);
});

router.all("/:transactionId/suspicious", clearanceRequired('manager'), async (req, res) => {
    if (req.method !== "PATCH") {
        return res.status(405).send({error: "Method Not Allowed"});
    }

    const transactionId = req.params.transactionId

    const transaction = await prisma.transaction.findUnique({where: { id: parseInt(transactionId) }})
    if (!transaction) {
        return res.status(404).send({ error: "Transaction not found" });
    }

    const keys = Object.keys(req.body);

    const allowedKeys = ['suspicious'];
    const unknownKeys = keys.filter(key => !allowedKeys.includes(key));
    if (unknownKeys.length > 0) {
        return res.status(400).json({ error: `Unknown field(s): ${unknownKeys.join(', ')}` });
    }

    const { suspicious } = req.body;

    if (!checkTypes([suspicious], 
                    ['boolean'],
                    [true])) {
                    return res.status(400).json({ error: "Faulty payload field type." });
    }

    const user = await prisma.user.findUnique({where: { utorid: transaction.utorid }})
    if (!user) {
        return res.status(404).send({ error: "User of transaction not found" });
    }

    if (suspicious) {
        if (!transaction.suspicious) {
            await prisma.transaction.update({
                where: {
                    id: parseInt(transactionId),
                },
                data: {
                    suspicious: true,
                    earned: 0
                }
            })

            let newPoints = user.points - transaction.amount // TODO: IS THE 'AMOUNT' OF THE TRANSACTION THE 'EARNED' AMOUNT? OR 'AMOUNT' AMOUNT?

            await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    points: newPoints,
                }
            })
        }
    }

    if (!suspicious) {
        if (transaction.suspicious) {
            await prisma.transaction.update({
                where: {
                    id: parseInt(transactionId),
                },
                data: {
                    suspicious: false,
                }
            })

            const new_points = user.points + transaction.amount // TODO: IS THE 'AMOUNT' OF THE TRANSACTION THE 'EARNED' AMOUNT? OR 'AMOUNT' AMOUNT?

            await prisma.user.update({
                where: {
                    utorid: transaction.utorid,
                },
                data: {
                    points: new_points,
                }
            })
        }
    }

    results = await prisma.transaction.findUnique({
        where : { id: parseInt(transactionId) },
        select: {
            id: true,
            utorid: true,
            type: true,
            spent: true,
            amount: true,
            promotions: { select: { promotionId: true } },
            suspicious: true, 
            remark: true,
            createdBy: { select: { utorid: true } },
            relatedId: true, // do we need to exclude this if its undefined?
            redeemed: true, // do we need to exclude this if its undefined?
        }
    });

    results.promotionIds = results.promotions.map(p => p.promotionId);
    delete results.promotions;
    results.createdBy = results.createdBy.utorid;

    if (results.type === 'purchase') {
        delete results.relatedId;
        delete results.redeemed;
    }
    if ((results.type === 'adjustment') || (results.type === 'event') || (results.type === 'transfer')) {
        delete results.redeemed;
    }
    if (results.type === 'event') {
        results.eventId = results.relatedId;
    }

    res.status(200).json(results);

});

router.all("/:transactionId/processed", clearanceRequired('cashier'), async (req, res) => {
    if (req.method !== "PATCH") {
        return res.status(405).send({error: "Method Not Allowed"});
    }

    const transactionId = req.params.transactionId

    let transaction = await prisma.transaction.findUnique({where: { id: parseInt(transactionId) }})
    if (!transaction) {
        return res.status(404).send({ error: "Transaction not found" });
    }
    if (transaction.type !== 'redemption') {
        return res.status(400).send({ error: "Transaction is not of type 'redemption'" });
    }
    if (transaction.processed) {
        return res.status(400).send({ error: "Transaction has already been processed" });
    }

    const keys = Object.keys(req.body);

    const allowedKeys = ['processed'];
    const unknownKeys = keys.filter(key => !allowedKeys.includes(key));
    if (unknownKeys.length > 0) {
        return res.status(400).json({ error: `Unknown field(s): ${unknownKeys.join(', ')}` });
    }

    const { processed } = req.body;

    if (!checkTypes([processed], 
                    ['boolean'],
                    [true])) {
                    return res.status(400).json({ error: "Faulty payload field type." });
    }

    if (!processed) {
        return res.status(400).json({ error: "Processed payload must be true" });
    }

    const userId = req.auth.id
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });
    if (!user) {
        return res.status(401).json({error: 'Unauthorized'})
    }

    // we will assume that the cashier will deduct money from a current purchase based on the redemption.
    // but we do not need to write any code that actually deducts money.
    
    await prisma.transaction.update({
        where: {
            id: parseInt(transactionId),
        },
        data: {
            processed: true,
            processedBy: { connect: { id: userId } },
            redeemed: transaction.amount,
            relatedId: userId
        }
    })

    let new_points = user.points - transaction.amount

    // update the user's point balance, after redemption
    await prisma.user.update({
        where: {
            utorid: transaction.utorid,
        },
        data: {
            points: new_points,
        }
    })
    
    results = await prisma.transaction.findUnique({
        where : { id: parseInt(transactionId) },
        select: {
            id: true,
            utorid: true,
            type: true,
            processedBy: { select: { utorid: true } },
            redeemed: true, 
            remark: true,
            createdBy: { select: { utorid: true } },
        }
    });

    results.processedBy = results.processedBy?.utorid ?? null;
    results.createdBy = results.createdBy?.utorid ?? null;

    res.status(200).json(results);
});

module.exports = router;
