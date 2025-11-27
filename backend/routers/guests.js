const express = require('express');
const router = express.Router( { mergeParams: true } );
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

router.post('/', async (req, res) => {
    const { utorid } = req.body;
    const eventId = parseInt(req.params.eventId);

    if (!req.body.utorid) {
        return res.status(400).json({ error: "Bad Request" });
    }

    if (!utorid || typeof utorid !== 'string') {
        return res.status(400).json({ error: "Bad Request" });
    }

    const authHdr = req.headers.authorization;
    if (!authHdr) return res.status(400).json({ error: "Bad Request" });

    const token = authHdr.split(' ')[1];
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        console.error("JWT verify failed:", err.message);
        return res.status(401).json({ error: "Unauthorized" });
    }

    const event = await prisma.event.findUnique({
        where : {id: eventId },
        include: {
            organizers: { include: { user: true } },
            guests: { include: { user: true } },
        }
    });

    if (!event) return res.status(404).json({ error: "Not Found" });

    if ((new Date(event.endTime) < new Date()) || 
        (event.capacity !== null && event.guests.length >= event.capacity)) {
        return res.status(410).json({ error: "Gone" });
    }

    const user = await prisma.user.findUnique({
        where: { utorid: utorid }
    });

    if (!user) return res.status(404).json({ error: "Not Found" });

    const isManagerOrSU = decoded.role === 'manager' || decoded.role === 'superuser';

    const inOrganizers = event.organizers.some(o => o.userId === user.id);
    if (inOrganizers) return res.status(400).json({ error: "Bad Request" });

    const isOrganizer = event.organizers.some(o => o.user.utorid === decoded.utorid);
    if (!isManagerOrSU && !isOrganizer) {
        return res.status(403).json({ error: "Forbidden" });
    }

    if (!event.published && !isManagerOrSU && !isOrganizer) {
        return res.status(404).json({ error: "Not Found" });
    }

    const isGuest = event.guests.some(g => g.userId === user.id);
    if (isGuest) return res.status(400).json({ error: "Bad Request" });

    await prisma.eventGuest.create({
        data: {
            eventId: event.id,
            userId: user.id
        }
    });

    const updatedEvent = await prisma.event.findUnique({
        where: {id: eventId },
        include: {
            guests: { include: { user: true } },
        }
    });

    return res.status(201).json({
        id: updatedEvent.id,
        name: updatedEvent.name,
        location: updatedEvent.location,
        guestAdded: {
            id: user.id,
            utorid: user.utorid,
            name: user.name
        },
        numGuests: updatedEvent.guests.length,
    })
});

router.all('/me', async (req, res) => { // I hate this route it took me so long
    const authHdr = req.headers.authorization;
    if (!authHdr) return res.status(400).json({ error: "Bad Request" });

    const token = authHdr.split(' ')[1];
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        console.error("JWT verify failed:", err.message);
        return res.status(401).json({ error: "Unauthorized" });
    }

    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
        return res.status(400).json({ error: "Bad Request" });
    }

    const event = await prisma.event.findUnique({
        where : {id: eventId },
        include: {
            organizers: { include: { user: true } },
            guests: { include: { user: true } },
        }
    });
    

    if (!event) return res.status(404).json({ error: "Not Found" });

    const user = await prisma.user.findUnique({
        where: { utorid: decoded.utorid }
    });

    const now = new Date();
    const isManagerOrSU = decoded.role === 'manager' || decoded.role === 'superuser';
    const isOrganizer = event.organizers.some(o => o.user.utorid === decoded.utorid);
    const isGuest = event.guests.some(g => g.userId === user.id);

    if (req.method === 'POST') {
        if (now > new Date(event.endTime)) return res.status(410).json({ error: "Gone" });

        if (!event.published && !isManagerOrSU && !isOrganizer) {
            return res.status(404).json({ error: "Not Found" });
        }

        if (isOrganizer || isGuest) return res.status(400).json({ error: "Bad Request" });

        if (event.capacity !== null && event.guests.length >= event.capacity) {
            return res.status(410).json({ error: "Gone" });
        }

        await prisma.eventGuest.create({
            data: {
                eventId: event.id,
                userId: user.id
            }
        });

        const numGuests = await prisma.eventGuest.count({ where: { eventId: event.id } });

        return res.status(201).json({
            id: event.id,
            name: event.name,
            location: event.location,
            guestAdded: {
                id: user.id,
                utorid: user.utorid,
                name: user.name,
            },
            numGuests,
        });
    } else if (req.method === 'DELETE') {
        if (!isGuest) return res.status(404).json({ error: "Not Found" });

        if (now > new Date(event.endTime)) return res.status(410).json({ error: "Gone" });

        await prisma.eventGuest.deleteMany({
            where: { eventId, userId: user.id }
        });

        return res.status(204).send();
    } else {
        return res.status(405).json({ error: "Method Not Allowed" });
    }
});


router.delete('/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);
    const eventId = parseInt(req.params.eventId);

    if (isNaN(eventId)) {
        return res.status(400).json({ error: "Bad Request" });
    }

    if (isNaN(userId)) {
        return res.status(400).json({ error: "Bad Request" });
    }

    const authHdr = req.headers.authorization;
    if (!authHdr) {
        return res.status(400).json({ error: "Bad Request"});
    }

    const token = authHdr.split(' ')[1];
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'manager' && decoded.role !== 'superuser') {
            return res.status(403).json({ error: "Forbidden" });
        }
    } catch (err) {
        console.error("JWT verify failed:", err.message);
        return res.status(401).json({ error: "Unauthorized" });
    }

    const event = await prisma.event.findUnique({
        where: {id: eventId },
        include: {
            organizers: { include: { user: true } },
            guests: { include: { user: true } },
        }
    });

    if (!event) return res.status(404).json({ error: "Not Found" });

    if (new Date(event.endTime) < new Date()) {
        return res.status(410).json({ error: "Gone" });
    }

    const isGuest = event.guests.some(o => o.userId === userId);
    if (!isGuest) return res.status(404).json({ error: "Not Found" });

    await prisma.eventGuest.deleteMany({
        where: { eventId, userId }
    });
    return res.status(204).send();
});

module.exports = router;