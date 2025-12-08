const express = require('express');
const { PrismaClient } = require('@prisma/client');
const organizersRouter = require('./organizers');
const guestsRouter = require('./guests');
const transactionsRouter = require('./transactions');

const router = express.Router();
const prisma = new PrismaClient();

function cleared(role, requiredRole) {
    const clearanceLevelsByIndex = ['regular', 'cashier', 'manager', 'superuser'];
    const curRoleLevel = clearanceLevelsByIndex.indexOf(role);
    const requiredLevel = clearanceLevelsByIndex.indexOf(requiredRole);
    
    return curRoleLevel >= requiredLevel;
}

// This is the implementation of GET (both regular and manager/superuser) and POST for /events :P
router.all('/', async (req, res) => {
    if (req.method === 'GET') {
        const role = req.auth.role;

        if (!role) {
            return res.status(401).json({error: 'Unauthorized'});
        }

        if (cleared(role, "regular") === false) {
            return res.status(403).json({error: 'Forbidden'});
        }
        
        const {
            name,
            location,
            published,
            started, 
            ended, 
            showFull,
            page = '1',
            limit = '10' 
        } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
            return res.status(400).json({ error: "Bad Request" });
        }

        const decoded = req.auth;
        if (!decoded) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        let showFullFilter = null;
        if (showFull !== undefined) {
            const normalized = typeof showFull === 'string' ? showFull.toLowerCase() : showFull;
            if (normalized === 'true') {
                showFullFilter = true;
            } else if (normalized === 'false') {
                showFullFilter = false;
            } else {
                return res.status(400).json({ error: "Bad Request" });
            }
        }

        const where = {};
        const now = new Date();

        if (name) where.name = { contains: name };
        if (location) where.location = { contains: location };

        if (started === 'true') {
            where.startTime = { lte: now };
        } else if (started === 'false') {
            where.startTime = { gt: now };
        }

        if (ended === 'true') {
            where.endTime = { lte: now };
        } else if (ended === 'false') {
            where.endTime = { gt: now };
        }

        if (decoded.role === 'manager' || decoded.role === 'superuser') {
            if (published === 'true') {
                where.published = true;
            } else if (published === 'false') {
                where.published = false;
            }
        } else {
            where.published = true;
        }
        const allEvents = await prisma.event.findMany({
            where,
            orderBy: { endTime: 'asc' },
            include: { _count: { select: { guests: true } }}
        });

        const filteredEvents = allEvents.filter((e) => {
            const numGuests = e._count.guests;
            const capacity = e.capacity;

            if (capacity === null || showFullFilter === null) return true;
            if (showFullFilter === true) return numGuests >= capacity;
            return numGuests < capacity;
        });

        const skip = (pageNum - 1) * limitNum;
        const take = limitNum;
        const paginatedEvents = filteredEvents.slice(skip, skip + take);

        const results = paginatedEvents.map((e) => {
            const numGuests = e._count.guests;

            if (decoded.role === 'manager' || decoded.role === 'superuser') {
                return {
                    id: e.id,
                    name: e.name,
                    location: e.location,
                    startTime: e.startTime,
                    endTime: e.endTime,
                    capacity: e.capacity,
                    pointsRemain: e.pointsRemain,
                    pointsAwarded: e.pointsAwarded,
                    published: e.published,
                    numGuests,
                }
            } else {
                return {
                    id: e.id,
                    name: e.name,
                    location: e.location,
                    startTime: e.startTime,
                    endTime: e.endTime,
                    capacity: e.capacity,
                    numGuests,
                };
            }
        });
        res.status(200).json({ count: filteredEvents.length, results });
    } else if (req.method === 'POST') {
        const role = req.auth.role;

        if (!role) {
            return res.status(401).json({error: 'Unauthorized'});
        }

        if (cleared(role, "manager") === false) {
            return res.status(403).json({error: 'Forbidden'});
        }

        const requiredKeys = ['name', 'description', 'location', 'startTime', 'endTime', 'points'];
        for (const key of requiredKeys) {
            if (!(key in req.body)) {
                return res.status(400).json({ error: "Bad Request" });
            }
        }
        const {
            name,
            description,
            location,
            startTime,
            endTime,
            capacity,
            points,
        } = req.body;

        if (typeof name !== 'string' ||
            typeof description !== 'string' ||
            typeof location !== 'string' ||
            typeof startTime !== 'string' ||
            typeof endTime !== 'string' ||
            typeof points !== 'number' ||
            (capacity !== undefined && capacity !== null &&
                typeof capacity !== 'number')
        ) {
            return res.status(400).json({ error: "Bad Request" });
        }

        const now = new Date();
        const start = new Date(startTime);
        const end = new Date(endTime);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ error: "Bad Request" });
        }

        if (end < now) {
            return res.status(400).json({ error: "Bad Request" });
        }

        if (start >= end) {
            return res.status(400).json({ error: "Bad Request" });
        }

        if (new Date(startTime) >= new Date(endTime)) {
            return res.status(400).json({ error: "Bad Request" });
        }

        if (!Date(startTime) || !Date(endTime)) {
            return res.status(400).json({ error: "Bad Request" });
        }

        if (capacity !== undefined && capacity < 0) {
            return res.status(400).json({ error: "Bad Request" });
        }

        if (typeof points !== 'number' || !Number.isInteger(points) || points <= 0) {
            return res.status(400).json({ error: "Bad Request" });
        }

        const decoded = req.auth;
        if (!decoded) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (decoded.role !== 'manager' && decoded.role !== 'superuser') {
            return res.status(403).json({ error: "Forbidden" });
        }

        try {
            const newEvent = await prisma.event.create({ 
                data: {
                    name,
                    description,
                    location,
                    startTime: new Date(startTime),
                    endTime: new Date(endTime),
                    capacity: capacity ?? null,
                    pointsRemain: points,
                    pointsAwarded: 0,
                    published: false,
                    organizers: { create: [] },
                    guests: { create: [] }
                },

                select: {
                    id: true,
                    name: true,
                    description: true,
                    location: true,
                    startTime: true,
                    endTime: true,
                    capacity: true,
                    pointsRemain: true,
                    pointsAwarded: true,
                    published: true,
                    organizers: true,
                    guests: true
                }
            });
            return res.status(201).json(newEvent);
        } catch (err) {
            // Handle rare sequence desync causing duplicate id errors
            if (err.code === 'P2002' && err.meta?.target?.includes('id')) {
                await prisma.$executeRawUnsafe(
                    `SELECT setval(pg_get_serial_sequence('"Event"', 'id'), COALESCE((SELECT MAX("id") FROM "Event"), 0) + 1, false)`
                );
                try {
                    const newEvent = await prisma.event.create({ 
                        data: {
                            name,
                            description,
                            location,
                            startTime: new Date(startTime),
                            endTime: new Date(endTime),
                            capacity: capacity ?? null,
                            pointsRemain: points,
                            pointsAwarded: 0,
                            published: false,
                            organizers: { create: [] },
                            guests: { create: [] }
                        },
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            location: true,
                            startTime: true,
                            endTime: true,
                            capacity: true,
                            pointsRemain: true,
                            pointsAwarded: true,
                            published: true,
                            organizers: true,
                            guests: true
                        }
                    });
                    return res.status(201).json(newEvent);
                } catch (innerErr) {
                    console.error("Failed to auto-repair event id sequence", innerErr);
                    return res.status(500).json({ error: "Internal Server Error" });
                }
            }
            console.error("Failed to create event", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    } else {
        return res.status(405).json({ error: "Method Not Allowed" });
    }
});

router.all('/:eventId', async (req, res) => {
    const decoded = req.auth;
    if (!decoded) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const id = parseInt(req.params.eventId);
    if (isNaN(id)) {
        return res.status(400).json({ error: "Bad Request" });
    }

    if (req.method === 'GET') {
        const event = await prisma.event.findUnique({
            where: { id: id},
            include: {
                organizers: { include: { user: true } },
                guests: { include: { user: true } },
                _count: { select: { guests: true } }
            }
        });

        if (!event) {
            return res.status(404).json({ error: "Not Found" });
        }

        const isOrganizer = event.organizers.some(o => o.user.utorid === decoded.utorid);
        const isManagerOrSU = decoded.role === 'manager' || decoded.role === 'superuser';
        
        if (!event.published && !isOrganizer && !isManagerOrSU) {
            return res.status(404).json({ error: "Not Found" });
        }

        const result = {
            id: event.id,
            name: event.name,
            description: event.description,
            location: event.location,
            startTime: event.startTime,
            endTime: event.endTime,
            capacity: event.capacity,
            ...(isManagerOrSU || isOrganizer
                ? {
                    pointsRemain: event.pointsRemain,
                    pointsAwarded: event.pointsAwarded,
                    published: event.published,
                    organizers: event.organizers.map((o) => ({
                        id: o.user.id,
                        utorid: o.user.utorid,
                        name: o.user.name,
                    })),
                    guests: event.guests.map((g) => ({
                        id: g.user.id,
                        utorid: g.user.utorid,
                        name: g.user.name,
                    })),
                }
                : {
                    organizers: event.organizers.map((o) => ({
                        id: o.user.id,
                        utorid: o.user.utorid,
                        name: o.user.name,
                    })),
                    numGuests: event._count.guests,
                }
                    ),
            };
        return res.status(200).json(result);
    } else if (req.method === 'PATCH') {
        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                organizers: { include: { user: true } },
                _count: { select: { guests: true } },
            },
        });

        if (!event) return res.status(404).json({ error: "Not Found" });

        const isOrganizer = event.organizers.some(o => o.user.utorid === decoded.utorid);
        const isManagerOrSU = decoded.role === 'manager' || decoded.role === 'superuser';
        if (!isOrganizer && !isManagerOrSU)
            return res.status(403).json({ error: "Forbidden" });

        const {
            name,
            description,
            location,
            startTime,
            endTime,
            capacity,
            points,
            pointsRemain,
            published
        } = req.body;

        const updateData = {};
        const now = new Date();

        if (!isManagerOrSU || event.startTime <= now) {
            if (name !== undefined || description !== undefined || location !== undefined || startTime !== undefined || endTime !== undefined || capacity !== undefined) {
                return res.status(400).json({ error: "Bad Request" });
            }
        }

        if (event.startTime <= now) {
            return res.status(400).json({ error: "Cannot update event that has started" });
        }

        if (startTime) {
            const startDate = new Date(startTime);
            if (isNaN(startDate.getTime()) || startDate < now)
                return res.status(400).json({ error: "Bad Request" });
            updateData.startTime = startDate;
        } 

        if (endTime) {
            const endDate = new Date(endTime);
            if (isNaN(endDate.getTime()) || endDate < now)
                return res.status(400).json({ error: "Bad Request" });
            updateData.endTime = endDate;
        }

        if (startTime && endTime) {
            const startDate = updateData.startTime || new Date(startTime);
            const endDate = updateData.endTime || new Date(endTime);
            if (startDate >= endDate) {
                return res.status(400).json({ error: "Bad Request" });
            }
        } else if (startTime) {
            const startDate = updateData.startTime;
            const endDate = event.endTime;
            if (startDate >= endDate) {
                return res.status(400).json({ error: "Bad Request" });
            }
        } else if (endTime) {
            const startDate = event.startTime;
            const endDate = updateData.endTime;
            if (startDate >= endDate) {
                return res.status(400).json({ error: "Bad Request" });
            }
        }

        if (capacity !== undefined && capacity !== null) {
            if (capacity < 0 || capacity < event._count.guests)
                return res.status(400).json({ error: "Bad Request" });
            updateData.capacity = capacity;
        }

        const hasPointsField = (points !== undefined && points !== null) || pointsRemain !== undefined;
        if (hasPointsField) {
            if (!isManagerOrSU)
                return res.status(403).json({ error: "Forbidden" });

            const rawPoints = points !== undefined ? points : pointsRemain;
            const parsedPoints = typeof rawPoints === 'string' ? Number(rawPoints) : rawPoints;
            if (!Number.isInteger(parsedPoints))
                return res.status(400).json({ error: "Bad Request" });

            if (points !== undefined) {
                if (parsedPoints <= 0)
                    return res.status(400).json({ error: "Bad Request" });
                if (parsedPoints < event.pointsAwarded)
                    return res.status(400).json({ error: "Bad Request" });
                updateData.pointsRemain = parsedPoints - event.pointsAwarded;
            } else {
                if (parsedPoints < 0)
                    return res.status(400).json({ error: "Bad Request" });
                updateData.pointsRemain = parsedPoints;
            }
        }

        if (published !== undefined && published !== null) {
            if (!isManagerOrSU)
                return res.status(403).json({ error: "Forbidden" });

            let publishValue = published;
            if (typeof publishValue === 'string') {
                const lowered = publishValue.toLowerCase();
                if (lowered === 'true') {
                    publishValue = true;
                } else if (lowered === 'false') {
                    publishValue = false;
                } else {
                    return res.status(400).json({ error: "Bad Request" });
                }
            }

            if (publishValue !== true && publishValue !== false)
                return res.status(400).json({ error: "Bad Request" });

            // disallow unpublishing once published
            if (event.published && publishValue === false) {
                return res.status(400).json({ error: "Cannot unpublish a published event" });
            }

            updateData.published = publishValue;
        }

        if (name !== undefined && name !== null) updateData.name = name;
        if (description !== undefined && description !== null) updateData.description = description;
        if (location !== undefined && location !== null) updateData.location = location;

        if (Object.keys(updateData).length === 0)
            return res.status(400).json({ error: "Bad Request" });

        const updatedEvent = await prisma.event.update({
            where: { id },
            data: updateData,
        });

        const response = {
            id: updatedEvent.id,
            name: updatedEvent.name,
            location: updatedEvent.location,
        };

        if (updateData.description !== undefined) response.description = updatedEvent.description;
        if (updateData.startTime !== undefined) response.startTime = updatedEvent.startTime;
        if (updateData.endTime !== undefined) response.endTime = updatedEvent.endTime;
        if (updateData.capacity !== undefined) response.capacity = updatedEvent.capacity;
        if (updateData.pointsRemain !== undefined) {
            response.pointsRemain = updatedEvent.pointsRemain;
            response.pointsAwarded = updatedEvent.pointsAwarded;
        }
        if (updateData.pointsAwarded !== undefined) response.pointsAwarded = updatedEvent.pointsAwarded;
        if (updateData.published !== undefined) response.published = updatedEvent.published;

        return res.status(200).json(response);
    } else if (req.method === 'DELETE') {
        try {
            const event = await prisma.event.findUnique({
                where: { id: id },
                include: {
                    organizers: { include: { user: true } },
                    _count: { 
                        select: {
                            guests: true,
                            transactions: true
                        } 
                    }
                }
            });

            if (!event) {
                return res.status(404).json({ error: "Not Found" });
            }

            if (event.published) {
                return res.status(400).json({ error: "Cannot delete published event" });
            }

            if (event._count.guests > 0) {
                return res.status(400).json({ error: "Cannot delete event with guests" });
            }

            if (event._count.transactions > 0) {
                return res.status(400).json({ error: "Cannot delete event with transactions" });
            }

            const isManagerOrSU = 
                decoded.role === 'manager' || decoded.role === 'superuser';

            const isOrganizer = event.organizers.some(o => o.user.utorid === decoded.utorid);
            if (!isOrganizer && !isManagerOrSU) {
                return res.status(403).json({ error: "Forbidden" });
            }

            await prisma.eventOrganizer.deleteMany({
                where: { eventId: id }
            });

            await prisma.event.delete({
                where: { id: id }
            });

            return res.status(204).send();
        } catch (error) {
            console.error('Error deleting event:', error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
});

// Mount organizersRouter and guestsRouter
router.use('/:eventId/organizers', organizersRouter);
router.use('/:eventId/guests', guestsRouter);

function checkTypes(values, types, isRequired) {
    return values.every((value, index) => {
        if (!isRequired[index] && value === undefined || value === null) {
            return true;
        }
        if (types[index] === 'array') {
            return Array.isArray(value);
        }
        return typeof value === types[index];
    });
}


router.all('/:eventId/transactions', async (req, res) => {
    console.log("creating an event transaction now...");
    if (req.method !== "POST") {
        return res.status(405).send({error: "Method Not Allowed"});
    }

    const role = req.auth.role;
    const userId = req.auth.id;
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

    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
        return res.status(404).json({error: 'Not Found'});
    }

    const event = await prisma.event.findUnique({
        where: {
            id: eventId
        },
        include: {
            _count: { select: { guests: true } }
        }
    });
    if (!event) {
        return res.status(404).json({error: 'Not Found'});
    }

    // first, check clearance of user
    const userIsOrganizer = await prisma.eventOrganizer.findUnique({
        where: {
            userId_eventId: {
                userId: userId,
                eventId: eventId
            }
        }
    });
    if (!userIsOrganizer && role !== 'manager' && role !== 'superuser') {
        return res.status(403).json({error: 'Forbidden'});
    }

    // then, check types of payload
    const allowedKeys = ['type', 'utorid', 'amount', 'remark'];
    const keys = Object.keys(req.body);
    const unknownKeys = keys.filter(key => !allowedKeys.includes(key));
    if (unknownKeys.length > 0) {
        console.log("FAILED: unknown keys present");
        return res.status(400).json({ error: `Unknown field(s): ${unknownKeys.join(', ')}` });
    }

    const { type, utorid, amount , remark } = req.body;
    console.log("here, amount is: ", amount);

    if (!checkTypes([type, utorid, amount, remark], 
                ['string', 'string', 'number', 'string'],
                [true, false, true, false])) {
        console.log("FAILED: faulty payload types");           
        return res.status(400).json({ error: "Faulty payload field type." });
    }

    if (type !== 'event') {
        console.log("FAILED: transaction isn't event");
        return res.status(400).json({ error: "Type of transaction must be event" });
    }

    if (utorid) {
        const user = await prisma.user.findUnique({
            where: { utorid: utorid }
        });
        if (!user) {
            console.log("FAILED: user can't be found");
            return res.status(400).json({ error: "UTORid must be of a guest of the event" });
        }
        const utoridIsGuest = await prisma.eventGuest.findUnique({
            where: {
                userId_eventId: {
                    userId: user.id,
                    eventId: eventId
                }
            }
        });
        if (!utoridIsGuest){
            console.log("FAILED: UTORid is not a guest of the event: ", user.id, eventId);
            return res.status(400).json({ error: "UTORid must be of a guest of the event" });
        }
    }
    if (amount <= 0 || !Number.isInteger(amount)) {
        console.log("FAILED: amount awarded is not a positive integer: ", amount);
        return res.status(400).json({ error: "Amount rewarded must be a positive integer" });
    }

    // event has:
    // - startTime
    // - endTime
    // - pointsRemain
    // - pointsAwarded
    // - published
    // - createdAt
    // - updatedAt
    // - organizers
    // - guests
    // - transactions

    // TODO: points can only be awarded to guests who RSVP and confirmed attendance
    // how do guests confirm attendace?

    // const now = new Date();
    // if (now < event.endTime) {
    //     console.log("FAILED: points can only be awarded after end of an event");
    //     return res.status(400).json({ error: "Points can only be awarded after an event has ended." });
    // }

    if (!utorid) {
        console.log("running it with no UTORid now");
        const numGuests = event._count.guests;
        if (numGuests === 0) {
            console.log("FAILED: no guests to award points to");
            return res.status(400).json({ error: "No guests to award points to" });
        }
        if (event.pointsRemain <= 0 || (amount * numGuests) > event.pointsRemain) {
            console.log("FAILED: not enough points to hand out");
            return res.status(400).json({ error: "Remaining points is less than requested amount" });
        }

        const eventGuests = await prisma.eventGuest.findMany({
            where: {
                eventId: eventId
            },
            include: {
                user: true
            }
        });

        const resBody = [];

        for (const guest of eventGuests) {
            const newTransaction = await prisma.transaction.create({
                data: {
                    utorid: guest.user.utorid,
                    type: "event",
                    remark: remark ?? "",
                    createdBy: { connect: { id: userId } },
                    relatedId: eventId,
                    amount: amount,
                    recipient: { connect: { id: guest.user.id } },
                    awarded: amount
                },
                include: {
                    createdBy: true
                }
            });

            resBody.push({
                id: newTransaction.id,
                recipient: newTransaction.utorid,
                awarded: newTransaction.awarded,
                type: newTransaction.type,
                relatedId: newTransaction.relatedId,
                remark: newTransaction.remark,
                createdBy: newTransaction.createdBy.utorid,
            });
        }

        const newPointsRemain = event.pointsRemain - (amount * numGuests);
        const newPointsAwarded = event.pointsAwarded + (amount * numGuests);
        await prisma.event.update({
            where: {
                id: event.id,
            },
            data: {
                pointsAwarded: newPointsAwarded,
                pointsRemain: newPointsRemain
            }
        });

        return res.status(200).json(resBody);

    } else {
        if (amount > event.pointsRemain) {
            console.log("FAILED: Remaining points is less than requested amount");
            return res.status(400).json({ error: "Remaining points is less than requested amount" });
        }

        const user = await prisma.user.findUnique({
            where: { utorid: utorid }
        });
        if (!user) {
            console.log("FAILED: User cannot be found");
            return res.status(400).json({ error: "UTORid must be of a guest of the event" });
        }

        const eventGuest = await prisma.eventGuest.findUnique({
            where: {
                userId_eventId: {
                    userId: user.id,
                    eventId: eventId
                }
            },
            include: {
                user: true
            }
        });

        if (!eventGuest) {
            console.log("FAILED: UTORid must be of a guest of the event");
            return res.status(400).json({ error: "UTORid must be of a guest of the event" });
        }

        const newTransaction = await prisma.transaction.create({
            data: {
                utorid: utorid,
                type: "event",
                remark: remark ?? "",
                createdBy: { connect: { id: userId } },
                relatedId: eventId,
                amount: amount,
                recipient: { connect: { id: eventGuest.user.id } },
                awarded: amount
            },
            include: {
                createdBy: true
            }
        });

        const responseBody = {
            id: newTransaction.id,
            recipient: newTransaction.utorid,
            awarded: newTransaction.awarded,
            type: newTransaction.type,
            relatedId: newTransaction.relatedId,
            remark: newTransaction.remark,
            createdBy: newTransaction.createdBy.utorid,
        };

        const newPointsRemain = event.pointsRemain - amount;
        const newPointsAwarded = event.pointsAwarded + amount;
        await prisma.event.update({
            where: {
                id: event.id,
            },
            data: {
                pointsAwarded: newPointsAwarded,
                pointsRemain: newPointsRemain
            }
        });
        return res.status(200).json(responseBody);
    }
});

module.exports = router;
