'use strict';

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const router = express.Router();

const clearanceRequired = require('../middleware/clearance');
const upload = require('../middleware/upload');
const prisma = new PrismaClient();

/*
 * POST /users/new
 * Register a new user
 * Clearance: Any
 */
router.post('/new', async (req, res) => {
    console.log("Running POST /users/new");
    const { utorid, name, email } = req.body;
    const bodyKeys = Object.keys(req.body);

    const allowedKeys = ['utorid', 'name', 'email'];
    const unknownKeys = bodyKeys.filter(key => !allowedKeys.includes(key));

    // 400 Bad Request 
    if (unknownKeys.length > 0) {
        return res.status(400).json({ error: `Unknown field(s): ${unknownKeys.join(', ')}` });
    }
    if (!utorid || !name || !email) {
        return res.status(400).json({ error: "Missing required field(s)." });
    }
    if (typeof utorid !== 'string' || utorid.length < 7 || utorid.length > 8) {
        return res.status(400).json({ error: "Utorid must contain 7-8 characters." });
    }
    if (typeof name !== 'string' || name.length < 1 || name.length > 50) {
        return res.status(400).json({ error: "Name must contain 1-50 characters." });
    }
    if (typeof email !== 'string' || !email.endsWith('mail.utoronto.ca')) {
        return res.status(400).json({ error: "Please enter a valid University of Toronto email." });
    }

    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    console.log(`Creating user with utorid: ${utorid}, name: ${name}, email: ${email}`);

    const existingUser = await prisma.user.findUnique({ where: { utorid } });
    if (existingUser) {
        return res.status(409).json({ error: "Utorid already in use." });
    }

    const existingUser1 = await prisma.user.findUnique({ where: { email } });
    if (existingUser1) {
        return res.status(409).json({ error: "Email already in use." });
    }

    const newUser = await prisma.user.create({
        data: {
            utorid: utorid,
            name: name,
            email: email,
            password: null,
            verified: false,
            role: 'regular',
            resetToken: resetToken,
            expiresAt: expiresAt
        }
    });

    // 201 Created
    return res.status(201).json({
        id: newUser.id,
        utorid: newUser.utorid,
        name: newUser.name,
        email: newUser.email,
        verified: newUser.verified,
        expiresAt: newUser.expiresAt,
        resetToken: newUser.resetToken
    });
});

/*
 * POST /users
 * Register a new user
 * Clearance: Cashier or higher
 */
router.post('/', clearanceRequired('cashier'), async (req, res) => {
    console.log("Running POST /users");
    const { utorid, name, email } = req.body;
    const bodyKeys = Object.keys(req.body);

    const allowedKeys = ['utorid', 'name', 'email'];
    const unknownKeys = bodyKeys.filter(key => !allowedKeys.includes(key));

    // 400 Bad Request 
    if (unknownKeys.length > 0) {
        return res.status(400).json({ error: `Unknown field(s): ${unknownKeys.join(', ')}` });
    }
    if (!utorid || !name || !email) {
        return res.status(400).json({ error: "Missing required field(s)" });
    }
    if (typeof utorid !== 'string' || utorid.length < 7 || utorid.length > 8) {
        return res.status(400).json({ error: "Utorid must be an alphanumeric string of 7-8 characters" });
    }
    if (typeof name !== 'string' || name.length < 1 || name.length > 50) {
        return res.status(400).json({ error: "name must be a string of 1-50 characters" });
    }
    if (typeof email !== 'string' || !email.endsWith('mail.utoronto.ca')) {
        return res.status(400).json({ error: "A valid University of Toronto email is required" });
    }

    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    console.log(`Creating user with utorid: ${utorid}, name: ${name}, email: ${email}`);

    const existingUser = await prisma.user.findUnique({ where: { utorid } });
    if (existingUser) {
        return res.status(409).json({ error: "Utorid already in use" });
    }

    const existingUser1 = await prisma.user.findUnique({ where: { email } });
    if (existingUser1) {
        return res.status(409).json({ error: "Email already in use." });
    }

    const newUser = await prisma.user.create({
        data: {
            utorid: utorid,
            name: name,
            email: email,
            password: null,
            verified: false,
            role: 'regular',
            resetToken: resetToken,
            expiresAt: expiresAt
        }
    });

    // 201 Created
    return res.status(201).json({
        id: newUser.id,
        utorid: newUser.utorid,
        name: newUser.name,
        email: newUser.email,
        verified: newUser.verified,
        expiresAt: newUser.expiresAt,
        resetToken: newUser.resetToken
    });
});

/*
 * GET /users
 * Retrieve a list of users
 * Clearance: Cashier or higher
 */
router.get('/', clearanceRequired('cashier'), async (req, res) => {
    console.log("Running GET /users");
    const { name, role, verified, activated, page = "1", limit = "10" } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({ error: "Invalid page number" });
    }
    if (isNaN(limitNum) || limitNum < 1) {
        return res.status(400).json({ error: "Invalid limit number" });
    }

    const validRoles = ['regular', 'cashier', 'manager', 'superuser'];
    if (role && !validRoles.includes(role)) {
        return res.status(400).json({ error: "Bad Request" });
    }

    const filters = {};
    if (name) {
        if (typeof name !== 'string') {
            return res.status(400).json({ error: "Bad Request" });
        }

        filters.OR = [
            { name: { contains: name } },
            { utorid: { contains: name } }
        ];
    }

    if (role) {
        filters.role = role;
    }

    if (verified !== undefined) {
        if (verified !== 'true' && verified !== 'false') {
            return res.status(400).json({ error: "Invalid verified value" });
        }
        filters.verified = (verified === 'true');
    }

    if (activated !== undefined) {
        if (activated !== 'true' && activated !== 'false') {
            return res.status(400).json({ error: "Invalid activated value" });
        }
        filters.lastLogin = (activated === 'true') ? { not: null } : null;
    }

    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;

    const [count, results] = await Promise.all([
        prisma.user.count({ where: filters }),
        prisma.user.findMany({
            where: filters,
            skip: skip,
            take: take,
            orderBy: { id: 'asc' },
            select: {
                id: true,
                utorid: true,
                name: true,
                email: true,
                birthday: true,
                role: true,
                points: true,
                createdAt: true,
                lastLogin: true,
                verified: true,
                avatarUrl: true,
                suspicious: true
            }
        })
    ]);

    return res.status(200).json({ count, results });
});

router.all('/', (req, res) => {
    res.setHeader('Allow', 'POST, GET');
    res.status(405).json({ error: "Method Not Allowed" });
});

// ----------------------------------------------------------------------


/**
 * PATCH /users/me
 * Update the current logged-in user's information
 * Clearance: Regular or higher
 */
router.patch('/me', clearanceRequired('regular'), upload.single('avatar'), async (req, res) => {
    console.log("Running PATCH /users/me");

    // Check for empty payload (no body fields and no file)
    if ((!req.body || Object.keys(req.body).length === 0) && !req.file) {
        return res.status(400).json({ error: "No update fields provided" });
    }

    const userId = req.auth.id;
    const { name, email, birthday } = req.body;
    const updateData = {};

    // Check if all provided fields are null (or undefined)
    const allFieldsNull = Object.keys(req.body).length > 0 &&
        Object.values(req.body).every(v => v === null || v === undefined);
    if (allFieldsNull && !req.file) {
        return res.status(400).json({ error: "No update fields provided" });
    }

    // Skip null/undefined fields and validate non-null values
    if (name !== undefined && name !== null) {
        if (typeof name !== 'string' || name.length < 1 || name.length > 50) {
            return res.status(400).json({ error: "name must be a string of 1-50 characters" });
        }
        updateData.name = name;
    }
    if (email !== undefined && email !== null) {
        if (typeof email !== 'string' || !email.endsWith('mail.utoronto.ca')) {
            return res.status(400).json({ error: "A valid University of Toronto email is required" });
        }
        updateData.email = email;
    }
    if (birthday !== undefined && birthday !== null) {
        if (typeof birthday !== 'string' || !birthday.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return res.status(400).json({ error: "Birthday must be in YYYY-MM-DD format" });
        }

        // Validate that it's a real date
        const [year, month, day] = birthday.split('-').map(Number);
        const date = new Date(Date.UTC(year, month - 1, day));
        if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
            return res.status(400).json({ error: "Invalid date" });
        }

        // Store as Date in database
        updateData.birthday = date;
    }    // File Upload
    if (req.file) {
        updateData.avatarUrl = `/uploads/avatars/${req.file.filename}`;
    }

    // Update user
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData
    });

    // Format birthday as YYYY-MM-DD string if it exists
    const formattedBirthday = updatedUser.birthday
        ? updatedUser.birthday.toISOString().split('T')[0]
        : null;

    // 200 OK
    res.status(200).json({
        id: updatedUser.id,
        utorid: updatedUser.utorid,
        name: updatedUser.name,
        email: updatedUser.email,
        birthday: formattedBirthday,
        role: updatedUser.role,
        points: updatedUser.points,
        createdAt: updatedUser.createdAt,
        lastLogin: updatedUser.lastLogin,
        verified: updatedUser.verified,
        avatarUrl: updatedUser.avatarUrl
    });

    // Do I have to check for duplicate email here????????
});

/**
 * GET /users/me
 * Retrieve the current logged-in user's information
 * Clearance: Regular or higher
 */
router.get('/me', clearanceRequired('regular'), async (req, res) => {
    console.log("Running GET /users/me");
    const userId = req.auth.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const computedPoints = await computeUserPointsForUser(user);

    // 200 OK
    res.status(200).json({
        id: user.id,
        utorid: user.utorid,
        name: user.name,
        email: user.email,
        birthday: user.birthday,
        role: user.role,
        points: computedPoints,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        verified: user.verified,
        avatarUrl: user.avatarUrl,
        promotions: Array.isArray(user.promotions) ? user.promotions : [] // Might need to call api method from promotions depending on implementation !!!!!!!!!!!!!!
        // promotions is not in the json body when testing. needs to be empty list
    });
});

// All other methods not allowed
router.all('/me', (req, res) => {
    res.setHeader('Allow', 'GET, PATCH');
    res.status(405).json({ error: "Method Not Allowed" });
});


// ----------------------------------------------------------------------

/**
 * PATCH /users/me/password
 * Update the current logged-in user's password
 * Clearance: Regular or higher
 */
router.patch('/me/password', clearanceRequired('regular'), async (req, res) => {
    const { old: oldPassword, new: newPassword } = req.body;
    const bodyKeys = Object.keys(req.body);

    // Check for extra fields
    if (bodyKeys.length > 2 || !bodyKeys.every(key => ['old', 'new'].includes(key))) {
        return res.status(400).json({ error: "Invalid field(s) in request body" });
    }

    // Check for missing required fields
    if (!oldPassword) {
        return res.status(400).json({ error: "Missing required field: old" });
    }
    if (!newPassword) {
        return res.status(400).json({ error: "Missing required field: new" });
    }

    const userId = req.auth.id;

    // Get User
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    // 404 Not Found
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    // 403 Forbidden
    if (user.password !== oldPassword) {
        return res.status(403).json({ error: "Incorrect password" });
    }

    // 400 Bad Request
    if (!isValidPassword(newPassword)) {
        return res.status(400).json({
            error: "New password does not meet requirements (8-20 chars, 1 upper, 1 lower, 1 num, 1 special)"
        });
    }

    // Update pass
    await prisma.user.update({
        where: { id: userId },
        data: { password: newPassword }
    });

    // 200 OK 
    res.status(200).json({ message: "Password updated successfully" });

});

router.all('/me/password', (req, res) => {
    res.setHeader('Allow', 'PATCH');
    res.status(405).json({ error: "Method Not Allowed" });
});

// ----------------------------------------------------------------------

/**
 * GET /users/:userId
 * Retrieve a specific user
 * Clearance: Cashier or higher
*/
router.get('/:userId', clearanceRequired('cashier'), async (req, res) => {
    console.log("Running GET /users/:userId");
    // 404 Bad Request

    let userId = req.params.userId;
    if (isNaN(userId)) {
        return res.status(400).json({ error: "User ID must be an integer" });
    }

    userId = parseInt(userId);
    if (userId < 0) {
        return res.status(400).json({ error: "User ID must be non-negative" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    // 404 Not found
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const userRole = req.auth.role;
    const computedPoints = await computeUserPointsForUser(user);
    if (userRole === 'manager' || userRole === 'superuser') {

        // Manager or higher response
        // Might need to call api method from promotions depending on implementation !!!!!!!!!!!!!! 
        // (are the list of promotions all promotions ever used? need to filter??)
        return res.status(200).json({
            id: user.id,
            utorid: user.utorid,
            name: user.name,
            email: user.email,
            birthday: user.birthday,
            role: user.role,
            points: computedPoints,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            verified: user.verified,
            avatarUrl: user.avatarUrl,
            promotions: Array.isArray(user.promotions) ? user.promotions : []
        });
    } else {
        // Cashier response 
        return res.status(200).json({
            id: user.id,
            utorid: user.utorid,
            name: user.name,
            points: computedPoints,
            verified: user.verified,
            promotions: Array.isArray(user.promotions) ? user.promotions : []
        });
    }

});

/**
 * PATCH /users/:userId
 * Update a specific user's various statuses and some information
 * Clearance: Manager or higher
 */
router.patch('/:userId', clearanceRequired('manager'), async (req, res) => {
    console.log("Running PATCH /users/:userId");

    // Check for empty payload
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "No update fields provided" });
    }

    // Validate userId
    const userIdInt = parseInt(req.params.userId);
    if (isNaN(userIdInt)) {
        return res.status(400).json({ error: "User ID must be an integer" });
    }

    const { email, verified, suspicious, role } = req.body;
    const bodyKeys = Object.keys(req.body);
    const allowedKeys = ['email', 'verified', 'suspicious', 'role'];

    for (const key of bodyKeys) {
        if (!allowedKeys.includes(key)) {
            return res.status(400).json({ error: `Unknown field(s): ${key}` });
        }
    }

    try {
        // Get user
        const user = await prisma.user.findUnique({
            where: { id: userIdInt }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Validate role and status
        const updateData = {};
        const managerRole = req.auth.role;

        console.log(`Manager role: ${managerRole}`);

        if (email !== undefined && email !== null) {
            if (typeof email !== 'string' || !email.endsWith('mail.utoronto.ca')) {
                return res.status(400).json({ error: "Invalid email" });
            }
            updateData.email = email;
        }

        if (verified !== undefined && verified !== null) {
            if (verified !== true) {
                return res.status(400).json({ error: "Verified should be set to true" });
            }
            updateData.verified = true;
        }
        if (suspicious !== undefined && suspicious !== null) {
            if (typeof suspicious !== 'boolean') {
                return res.status(400).json({ error: "Suspicious must be a boolean" });
            }
            updateData.suspicious = suspicious;
        }

        if (role !== undefined && role !== null) {
            // Manager can only set 'cashier' or 'regular'
            if (managerRole === 'manager') {
                if (role !== 'cashier' && role !== 'regular') {
                    return res.status(403).json({ error: "Managers can only set roles to 'cashier' or 'regular'" });
                }
            }
            // Superuser can set any valid role
            if (managerRole === 'superuser') {
                if (!['regular', 'cashier', 'manager', 'superuser'].includes(role)) {
                    return res.status(400).json({ error: "Invalid role specified" });
                }
            }
            
            // Prevent promoting suspicious users to cashier
            if (role === 'cashier') {
                const isSuspicious = suspicious ?? user.suspicious;
                if (isSuspicious) {
                    return res.status(400).json({ error: "Suspicious users cannot be promoted to cashier" });
                }
            }
            updateData.role = role;
        }

        console.log("Update user");
        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: userIdInt },
            data: updateData
        });

        const response = {
            id: updatedUser.id,
            utorid: updatedUser.utorid,
            name: updatedUser.name
        };
        for (const key of bodyKeys) {
            if (req.body[key] !== null && req.body[key] !== undefined) {
                response[key] = updatedUser[key];
            }
        }
        // 200 OK
        res.status(200).json(response);

    } catch (err) {
        // Can't change to email with an account already
        if (err.code === 'P2002' && err.meta?.target.includes('email')) {
            return res.status(409).json({ error: "Email already in use" });
        }
    }
});

// All other methods not allowed
router.all('/:userId', (req, res) => {
    res.setHeader('Allow', 'GET, PATCH');
    res.status(405).json({ error: "Method Not Allowed" });
});

async function computeUserPointsForUser(user) {
    const transactions = await prisma.transaction.findMany({
        where: { utorid: user.utorid },
        select: {
            type: true,
            amount: true,
            suspicious: true,
            processed: true,
            senderId: true,
            recipientId: true
        }
    });

    let total = 0;

    for (const t of transactions) {
        if (t.suspicious) continue;
        if (t.type === "purchase" || t.type === "event") {
            total += t.amount;
            continue;
        }
        if (t.type === "transfer") {
            if (t.senderId === user.id) {
                total -= t.amount;
            } else if (t.recipientId === user.id) {
                total += t.amount;
            }
            continue;
        }
        if (t.type === "redemption") {
            if (t.processed) {
                total -= t.amount;
            }
            continue;
        }
    }

    return total;
}

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

router.all("/me/transactions", clearanceRequired('regular'), async (req, res) => {
    if (req.method !== "POST" && req.method !== "GET") {
        return res.status(405).send({error: "Method Not Allowed"});
    }
    if (req.method === "POST") {
        const keys = Object.keys(req.body);
        const allowedKeys = ['type', 'amount', 'remark'];
        const unknownKeys = keys.filter(key => !allowedKeys.includes(key));
        if (unknownKeys.length > 0) {
            return res.status(400).json({ error: `Unknown field(s): ${unknownKeys.join(', ')}` });
        }

        let { type, amount, remark } = req.body;

        const userId = req.auth.id;
        const user = await prisma.user.findUnique({where: { id: userId }})

        if (!checkTypes([type, amount, remark], 
                        ['string', 'number', 'string'],
                        [true, true, false])) {
                        return res.status(400).json({ error: "Faulty payload field type." });
        }
        if (type !== 'redemption') {
            return res.status(400).json({ error: "Type must be redemption" });
        }
        if (amount <= 0 || !Number.isInteger(amount)) {
            return res.status(400).json({ error: "Redemption amount must be positive integer" });
        }
        if (amount > user.points) {
            return res.status(400).json({ error: "Redemption amount exceeds point balance." });
        }
        if (!user.verified) {
            return res.status(403).json({ error: "Forbidden: user is not verified" });
        }

        const newRedemption = await prisma.transaction.create({
            data: {
                utorid: user.utorid,
                type: type,
                amount: amount,
                relatedId: null,
                createdBy: {
                    connect: { id: user.id }
                },
                remark: remark ?? "",
                processed: false
            },
            include: {
                createdBy: {
                    select: { utorid: true }
                }
            }
        })

        return res.status(201).json({
            id: newRedemption.id,
            utorid: newRedemption.utorid,
            type: newRedemption.type,
            processedBy: null,
            amount: newRedemption.amount,
            remark: newRedemption.remark,
            createdBy: newRedemption.createdBy.utorid
        });
    }
    if (req.method === "GET") {
        // Support filters from either query string (?page=1&limit=10...) or JSON body (legacy)
        const source = Object.keys(req.query).length ? req.query : req.body;
        const keys = Object.keys(source);
        const allowedKeys = ['type', 'relatedId', 'promotionId', 'amount', 'operator', 'page', 'limit'];
        const unknownKeys = keys.filter(key => !allowedKeys.includes(key));
        if (unknownKeys.length > 0) {
            return res.status(400).json({ error: `Unknown field(s): ${unknownKeys.join(', ')}` });
        }

        let { type, relatedId, promotionId, amount, operator, page, limit } = source;

        // Coerce primitive types from query-string values where necessary
        if (typeof relatedId === 'string') {
            relatedId = relatedId.length ? Number(relatedId) : undefined;
        }
        if (typeof promotionId === 'string') {
            promotionId = promotionId.length ? Number(promotionId) : undefined;
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

        const userId = req.auth.id;
        const user = await prisma.user.findUnique({where: { id: userId }})

        if (!checkTypes([type, relatedId, promotionId, amount, operator, page, limit], 
                        ['string', 'number', 'number', 'number', 'string', 'number', 'number'],
                        [false, false, false, false, false, false, false])) {
                        return res.status(400).json({ error: "Faulty payload field type." });
        }
        const where = {};

        where.utorid = user.utorid;

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

        if (promotionId) {
            where.promotions = {
                some: {
                    promotionId: parseInt(promotionId)
                }
            };
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
                    type: true,
                    spent: true,
                    amount: true,
                    promotions: { select: { promotionId: true } },
                    remark: true,
                    createdBy: { select: { utorid: true } },
                }
            })
        ]);

        for (const field of results) {
            field.promotionIds = field.promotions.map(p => p.promotionId);
            delete field.promotions;
            field.createdBy = field.createdBy.utorid;
        }
        res.status(200).json({ count, results });
    }
});

// Lightweight lookup by UTORid so clients can resolve a userId before transfer
router.get("/resolve/:utorid", clearanceRequired('regular'), async (req, res) => {
    const utorid = req.params.utorid;
    if (!utorid || typeof utorid !== "string") {
        return res.status(400).json({ error: "Bad Request" });
    }

    const user = await prisma.user.findUnique({
        where: { utorid },
        select: { id: true, utorid: true, name: true }
    });

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
});

router.all("/:userId/transactions", clearanceRequired('regular'), async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).send({error: "Method Not Allowed"});
    }
    const keys = Object.keys(req.body);
    const allowedKeys = ['type', 'amount', 'remark'];
    const unknownKeys = keys.filter(key => !allowedKeys.includes(key));
    if (unknownKeys.length > 0) {
        return res.status(400).json({ error: `Unknown field(s): ${unknownKeys.join(', ')}` });
    }

    const { type, amount, remark } = req.body;

    if (!checkTypes([type, amount, remark], 
                    ['string', 'number', 'string'],
                    [true, true, false])) {
                    return res.status(400).json({ error: "Faulty payload field type." });
    }

    const senderId = req.auth.id;
    const sender = await prisma.user.findUnique({where: { id: senderId }})

    if (type !== 'transfer') { 
        return res.status(400).json({ error: "Type must be transfer." });
    }
    if (amount <= 0 || !Number.isInteger(amount)) {
        return res.status(400).json({ error: "Amount must be positive integer." });
    }
    if (amount > sender.points) {
        return res.status(400).json({ error: "Amount to send exceeds point balance." });
    }
    if (!sender.verified) {
        return res.status(403).json({ error: "Forbidden: sender not verified." });
    }

    const receiverIdentifier = req.params.userId;
    const receiver = isNaN(receiverIdentifier)
        ? await prisma.user.findUnique({ where: { utorid: receiverIdentifier } })
        : await prisma.user.findUnique({ where: { id: parseInt(receiverIdentifier) } });

    if (!receiver) {
        return res.status(404).send({ error: "Receiver with id or utorid not found" });
    }

    const newTransfer1 = await prisma.transaction.create({
        data: {
            utorid: sender.utorid,
            type: type,
            amount: amount,
            relatedId: receiver.id,
            createdBy: {
                connect: { id: sender.id }
            },
            remark: remark ?? "",
            sender: {
                connect: { id: sender.id }
            },
            recipient: {
                connect: { id: receiver.id }
            }
        },
        include: {
            createdBy: { select: { utorid: true } },
            recipient: { select: { utorid: true } },
            sender: { select: { utorid: true } }
        }
    })

    const newTransfer2 = await prisma.transaction.create({
        data: {
            utorid: receiver.utorid,
            type: type,
            amount: amount,
            relatedId: sender.id,
            createdBy: {
                connect: { id: sender.id }
            },
            remark: remark ?? "",
            sender: {
                connect: { id: sender.id }
            },
            recipient: {
                connect: { id: receiver.id }
            }
        },
        include: {
            createdBy: {
                select: { utorid: true }
            }
        }
    })

    // now, update the points in the users accordingly

    await prisma.user.update({
        where: {
            id: sender.id
        },
        data: {
            points: sender.points - amount
        }
    })

    await prisma.user.update({
        where: {
            id: receiver.id
        },
        data: {
            points: receiver.points + amount
        }
    })

    return res.status(201).json({
        id: newTransfer1.id,
        sender: newTransfer1.utorid,
        recipient: newTransfer1.recipient.utorid,
        type: newTransfer1.type,
        sent: newTransfer1.amount,
        remark: newTransfer1.remark,
        createdBy: newTransfer1.createdBy.utorid
    });
});

// ----------------------------------------------------------------------

// Helper function to validate password requirements
function isValidPassword(password) {
    var hasLower = false;
    var hasUpper = false;
    var hasNumber = false;
    var hasSpecial = false;

    for (const c of password) {
        if ('a' <= c && c <= 'z') {
            hasLower = true;
        } else if ('A' <= c && c <= 'Z') {
            hasUpper = true;
        } else if ('0' <= c && c <= '9') {
            hasNumber = true;
        } else {
            hasSpecial = true;
        }
    }
    return hasLower &&
        hasUpper &&
        hasNumber &&
        hasSpecial &&
        password.length >= 8 &&
        password.length <= 20;
}

// Helper function to validate birthday format and value
function isValidBirthday(date) {
    // Accept Date objects
    if (date instanceof Date) {
        return !isNaN(date.getTime());
    }

    if (typeof date !== 'string') return false;

    const s = date.trim();

    // Accept YYYY-MM-DD or YYYY-MM-DD followed by time (e.g. T00:00:00Z)
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ].*)?$/);
    if (!m) return false;

    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);

    // Basic range checks
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;

    // Construct UTC date and compare components to avoid timezone issues
    const d = new Date(Date.UTC(year, month - 1, day));
    return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day;
}

/**
 * GET /users/me/guests
 * Returns all event IDs the current user is a guest of
 * Clearance: Regular or higher
 */
router.get('/me/guests', clearanceRequired('regular'), async (req, res) => {
    const authHdr = req.headers.authorization;
    if (!authHdr) return res.status(401).json({ error: "Unauthorized" });

    const token = authHdr.split(' ')[1];
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
        where: { utorid: decoded.utorid },
        include: { guest: true }
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    // user.guest is an array of EventGuest objects
    const eventIds = user.guest.map(g => g.eventId);

    return res.json({ eventIds });
});

module.exports = router;
