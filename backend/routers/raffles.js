const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

function cleared(role, requiredRole) {
    const clearanceLevelsByIndex = ['regular', 'cashier', 'manager', 'superuser'];
    const curRoleLevel = clearanceLevelsByIndex.indexOf(role);
    const requiredLevel = clearanceLevelsByIndex.indexOf(requiredRole);
    
    return curRoleLevel >= requiredLevel;
}

/* GET & POST /raffles */
router.all("/", async (req, res) => {
    if (req.method === "GET") {
        const role = req.auth?.role;
        
        if (!role) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        let { page = 1, limit = 10, status } = req.query;
        const where = {};
        
        page = parseInt(page) || 1;
        if (page < 1) {
            return res.status(400).send({ error: "Page must be greater than 0" });
        }

        limit = parseInt(limit) || 10;
        if (limit < 1) {
            return res.status(400).send({ error: "Limit must be greater than 0" });
        }

        const now = new Date();
        
        // Filter by status: 'open', 'closed', 'drawn'
        if (status === 'open') {
            where.startTime = { lte: now };
            where.endTime = { gte: now };
            where.drawn = false;
        } else if (status === 'closed') {
            where.endTime = { lt: now };
            where.drawn = false;
        } else if (status === 'drawn') {
            where.drawn = true;
        } else if (status === 'upcoming') {
            where.startTime = { gt: now };
        }
        // If no status filter, show all

        const skip = (page - 1) * limit;
        const take = limit;
        
        const userId = req.auth?.id;
        
        const [count, results] = await Promise.all([
            prisma.raffle.count({ where }),
            prisma.raffle.findMany({
                where,
                skip,
                take,
                orderBy: { endTime: 'asc' },
                include: {
                    _count: {
                        select: { entries: true }
                    },
                    winner: {
                        select: {
                            id: true,
                            utorid: true,
                            name: true
                        }
                    }
                }
            })
        ]);

        // Check user entries for all raffles if user is logged in
        let userEntries = [];
        if (userId) {
            const entryIds = results.map(r => r.id);
            userEntries = await prisma.raffleEntry.findMany({
                where: {
                    raffleId: { in: entryIds },
                    userId: userId
                },
                select: {
                    raffleId: true
                }
            });
        }
        const userEntryRaffleIds = new Set(userEntries.map(e => e.raffleId));

        // Format response
        const formattedResults = results.map(raffle => ({
            id: raffle.id,
            name: raffle.name,
            description: raffle.description,
            pointCost: raffle.pointCost,
            prizePoints: raffle.prizePoints,
            startTime: raffle.startTime,
            endTime: raffle.endTime,
            drawTime: raffle.drawTime,
            drawn: raffle.drawn,
            entryCount: raffle._count.entries,
            winner: raffle.winner ? {
                id: raffle.winner.id,
                utorid: raffle.winner.utorid,
                name: raffle.winner.name
            } : null,
            userEntered: userEntryRaffleIds.has(raffle.id)
        }));

        res.json({ count, results: formattedResults });
    } else if (req.method === "POST") {
        const role = req.auth?.role;

        if (!role) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        if (cleared(role, "manager") === false) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const { 
            name, 
            description, 
            pointCost, 
            prizePoints,
            startTime, 
            endTime,
            drawTime,
            ...rest
        } = req.body;

        // Validate required fields
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).send({ error: "Name is required" });
        }

        if (!description || typeof description !== 'string' || description.trim() === '') {
            return res.status(400).send({ error: "Description is required" });
        }

        if (pointCost === undefined || pointCost === null || !Number.isInteger(pointCost) || pointCost <= 0) {
            return res.status(400).send({ error: "Point cost must be a positive integer" });
        }

        if (prizePoints === undefined || prizePoints === null || !Number.isInteger(prizePoints) || prizePoints <= 0) {
            return res.status(400).send({ error: "Prize points must be a positive integer" });
        }

        if (!startTime) {
            return res.status(400).send({ error: "Start time is required" });
        }

        if (!endTime) {
            return res.status(400).send({ error: "End time is required" });
        }

        if (!drawTime) {
            return res.status(400).send({ error: "Draw time is required" });
        }

        const start = new Date(startTime);
        const end = new Date(endTime);
        const draw = new Date(drawTime);

        if (isNaN(start.getTime())) {
            return res.status(400).send({ error: "Invalid start time format" });
        }

        if (isNaN(end.getTime())) {
            return res.status(400).send({ error: "Invalid end time format" });
        }

        if (isNaN(draw.getTime())) {
            return res.status(400).send({ error: "Invalid draw time format" });
        }

        if (end < start) {
            return res.status(400).send({ error: "End time must be after start time" });
        }

        if (draw < end) {
            return res.status(400).send({ error: "Draw time must be after end time" });
        }

        // Check for extra fields
        if (Object.keys(rest).length > 0) {
            return res.status(400).send({ error: "Bad Request: Unknown fields" });
        }

        const data = { name, description, pointCost, prizePoints, startTime: start, endTime: end, drawTime: draw };
        const newRaffle = await prisma.raffle.create({ data });
        
        return res.status(201).json({
            id: newRaffle.id,
            name: newRaffle.name,
            description: newRaffle.description,
            pointCost: newRaffle.pointCost,
            prizePoints: newRaffle.prizePoints,
            startTime: newRaffle.startTime,
            endTime: newRaffle.endTime,
            drawTime: newRaffle.drawTime,
            drawn: newRaffle.drawn
        });
    } else {
        return res.status(405).send({ error: "Method Not Allowed" });
    }
});

/* GET /raffles/:raffleId */
router.get("/:raffleId", async (req, res) => {
    const role = req.auth?.role;
    
    if (!role) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const id = parseInt(req.params.raffleId);
    if (isNaN(id)) {
        return res.status(400).json({ error: "Bad Request" });
    }

    const raffle = await prisma.raffle.findUnique({
        where: { id },
        include: {
            _count: {
                select: { entries: true }
            },
            winner: {
                select: {
                    id: true,
                    utorid: true,
                    name: true
                }
            }
        }
    });

    if (!raffle) {
        return res.status(404).json({ error: "Raffle not found" });
    }

    // Check if user has entered this raffle
    let userEntry = null;
    if (req.auth?.id) {
        userEntry = await prisma.raffleEntry.findUnique({
            where: {
                raffleId_userId: {
                    raffleId: id,
                    userId: req.auth.id
                }
            }
        });
    }

    return res.status(200).json({
        id: raffle.id,
        name: raffle.name,
        description: raffle.description,
        pointCost: raffle.pointCost,
        prizePoints: raffle.prizePoints,
        startTime: raffle.startTime,
        endTime: raffle.endTime,
        drawTime: raffle.drawTime,
        drawn: raffle.drawn,
        entryCount: raffle._count.entries,
        winner: raffle.winner ? {
            id: raffle.winner.id,
            utorid: raffle.winner.utorid,
            name: raffle.winner.name
        } : null,
        userEntered: userEntry !== null
    });
});

/* POST /raffles/:raffleId/enter - User enters a raffle */
router.post("/:raffleId/enter", async (req, res) => {
    const role = req.auth?.role;
    const userId = req.auth?.id;
    
    if (!role || !userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Managers and superusers cannot join raffles
    if (role === "manager" || role === "superuser") {
        return res.status(403).json({ error: "Managers and superusers cannot join raffles" });
    }

    const raffleId = parseInt(req.params.raffleId);
    if (isNaN(raffleId)) {
        return res.status(400).json({ error: "Bad Request" });
    }

    // Get raffle
    const raffle = await prisma.raffle.findUnique({
        where: { id: raffleId }
    });

    if (!raffle) {
        return res.status(404).json({ error: "Raffle not found" });
    }

    // Check if raffle is open
    const now = new Date();
    if (raffle.startTime > now) {
        return res.status(400).json({ error: "Raffle has not started yet" });
    }

    if (raffle.endTime < now) {
        return res.status(400).json({ error: "Raffle has ended" });
    }

    if (raffle.drawn) {
        return res.status(400).json({ error: "Raffle has already been drawn" });
    }

    // Check if user already entered
    const existingEntry = await prisma.raffleEntry.findUnique({
        where: {
            raffleId_userId: {
                raffleId: raffleId,
                userId: userId
            }
        }
    });

    if (existingEntry) {
        return res.status(400).json({ error: "You have already entered this raffle" });
    }

    // Get user and check points
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    // Calculate user's actual points (similar to how transactions do it)
    // For now, use user.points directly, but you might want to compute it like transactions do
    if (user.points < raffle.pointCost) {
        return res.status(400).json({ error: "Insufficient points to enter this raffle" });
    }

    // Create entry and deduct points in a transaction
    try {
        await prisma.$transaction(async (tx) => {
            // Create entry
            await tx.raffleEntry.create({
                data: {
                    raffleId: raffleId,
                    userId: userId
                }
            });

            // Deduct points from user
            await tx.user.update({
                where: { id: userId },
                data: {
                    points: {
                        decrement: raffle.pointCost
                    }
                }
            });

            // Create a transaction record for the entry fee
            await tx.transaction.create({
                data: {
                    utorid: user.utorid,
                    type: 'redemption',
                    amount: raffle.pointCost,
                    spent: raffle.pointCost,
                    remark: `Raffle entry: ${raffle.name}`,
                    createdById: userId
                }
            });
        });

        return res.status(201).json({ 
            message: "Successfully entered raffle",
            pointsRemaining: user.points - raffle.pointCost
        });
    } catch (error) {
        console.error("Error entering raffle:", error);
        return res.status(500).json({ error: "Failed to enter raffle" });
    }
});

/* POST /raffles/:raffleId/draw - Draw winner (Manager+) */
router.post("/:raffleId/draw", async (req, res) => {
    const role = req.auth?.role;
    
    if (!role) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (cleared(role, "manager") === false) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const raffleId = parseInt(req.params.raffleId);
    if (isNaN(raffleId)) {
        return res.status(400).json({ error: "Bad Request" });
    }

    const raffle = await prisma.raffle.findUnique({
        where: { id: raffleId },
        include: {
            entries: {
                include: {
                    user: true
                }
            }
        }
    });

    if (!raffle) {
        return res.status(404).json({ error: "Raffle not found" });
    }

    if (raffle.drawn) {
        return res.status(400).json({ error: "Winner has already been drawn for this raffle" });
    }

    const now = new Date();
    if (raffle.drawTime > now) {
        return res.status(400).json({ error: "Draw time has not been reached yet" });
    }

    if (raffle.entries.length === 0) {
        return res.status(400).json({ error: "No entries in this raffle" });
    }

    // Random selection
    const randomIndex = Math.floor(Math.random() * raffle.entries.length);
    const winnerEntry = raffle.entries[randomIndex];
    const winnerId = winnerEntry.userId;
    const winner = winnerEntry.user;

    // Update raffle with winner and award prize points
    const updatedRaffle = await prisma.$transaction(async (tx) => {
        // Update raffle with winner
        const updated = await tx.raffle.update({
            where: { id: raffleId },
            data: {
                winnerId: winnerId,
                drawn: true
            },
            include: {
                winner: {
                    select: {
                        id: true,
                        utorid: true,
                        name: true
                    }
                }
            }
        });

        // Award prize points to winner
        await tx.user.update({
            where: { id: winnerId },
            data: {
                points: {
                    increment: raffle.prizePoints
                }
            }
        });

        // Create transaction record for prize award
        await tx.transaction.create({
            data: {
                utorid: winner.utorid,
                type: 'event',
                amount: raffle.prizePoints,
                earned: raffle.prizePoints,
                remark: `Raffle prize: ${raffle.name}`,
                createdById: winnerId
            }
        });

        return updated;
    });

    return res.status(200).json({
        message: "Winner drawn successfully",
        raffle: {
            id: updatedRaffle.id,
            name: updatedRaffle.name,
            prizePoints: raffle.prizePoints,
            winner: {
                id: updatedRaffle.winner.id,
                utorid: updatedRaffle.winner.utorid,
                name: updatedRaffle.winner.name
            }
        }
    });
});

/* PATCH /raffles/:raffleId */
router.patch("/:raffleId", async (req, res) => {
    const role = req.auth?.role;

    if (!role) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (cleared(role, "manager") === false) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const id = parseInt(req.params.raffleId);
    if (isNaN(id)) {
        return res.status(400).json({ error: "Bad Request" });
    }

    const raffle = await prisma.raffle.findUnique({
        where: { id }
    });

    if (!raffle) {
        return res.status(404).json({ error: "Not Found" });
    }

    // Can't edit if already drawn
    if (raffle.drawn) {
        return res.status(400).json({ error: "Cannot edit raffle after winner has been drawn" });
    }

    const data = {};
    const allowedFields = ['name', 'description', 'pointCost', 'prizePoints', 'startTime', 'endTime', 'drawTime'];
    
    for (const key of Object.keys(req.body)) {
        const value = req.body[key];
        
        if (!allowedFields.includes(key)) {
            return res.status(400).send({ error: `Field '${key}' is not allowed to be updated` });
        }

        if (value !== null && value !== undefined) {
            if (key === 'name' || key === 'description') {
                if (typeof value !== 'string' || value.trim() === '') {
                    return res.status(400).send({ error: `${key} must be a non-empty string` });
                }
                data[key] = value;
            } else if (key === 'pointCost' || key === 'prizePoints') {
                if (!Number.isInteger(value) || value <= 0) {
                    return res.status(400).send({ error: `${key} must be a positive integer` });
                }
                data[key] = value;
            } else if (key === 'startTime' || key === 'endTime' || key === 'drawTime') {
                const dateValue = new Date(value);
                if (isNaN(dateValue.getTime())) {
                    return res.status(400).send({ error: `Invalid ${key} format` });
                }
                data[key] = dateValue;
            }
        }
    }

    // Validate time relationships if any times are being updated
    const finalStartTime = data.startTime || raffle.startTime;
    const finalEndTime = data.endTime || raffle.endTime;
    const finalDrawTime = data.drawTime || raffle.drawTime;

    if (finalEndTime < finalStartTime) {
        return res.status(400).send({ error: "End time must be after start time" });
    }

    if (finalDrawTime < finalEndTime) {
        return res.status(400).send({ error: "Draw time must be after end time" });
    }

    const updatedRaffle = await prisma.raffle.update({
        where: { id },
        data
    });

    return res.status(200).json({
        id: updatedRaffle.id,
        name: updatedRaffle.name,
        description: updatedRaffle.description,
        pointCost: updatedRaffle.pointCost,
        prizePoints: updatedRaffle.prizePoints,
        startTime: updatedRaffle.startTime,
        endTime: updatedRaffle.endTime,
        drawTime: updatedRaffle.drawTime,
        drawn: updatedRaffle.drawn
    });
});

/* DELETE /raffles/:raffleId */
router.delete("/:raffleId", async (req, res) => {
    const role = req.auth?.role;

    if (!role) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (cleared(role, "manager") === false) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    
    const id = parseInt(req.params.raffleId);
    if (isNaN(id)) {
        return res.status(400).json({ error: "Bad Request" });
    }

    const raffle = await prisma.raffle.findUnique({
        where: { id }
    });

    if (!raffle) {
        return res.status(404).json({ error: "Not Found" });
    }

    // Can't delete if already drawn or has entries
    if (raffle.drawn) {
        return res.status(403).json({ error: "Cannot delete raffle after winner has been drawn" });
    }

    const entryCount = await prisma.raffleEntry.count({
        where: { raffleId: id }
    });

    if (entryCount > 0) {
        return res.status(403).json({ error: "Cannot delete raffle with existing entries" });
    }

    await prisma.raffle.delete({
        where: { id }
    });
    
    res.status(204).send();
});

module.exports = router;

