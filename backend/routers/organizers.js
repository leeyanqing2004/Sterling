const express = require('express');
const router = express.Router( { mergeParams: true } );
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

router.post('/', async (req, res) => {
    const { utorid } = req.body;
    const eventId = parseInt(req.params.eventId);

    if (isNaN(eventId)) {
        return res.status(400).json({ error: "Bad Request" });
    }

    if (!req.body.utorid) {
        return res.status(400).json({ error: "Bad Request" });
    }

    if (typeof utorid !== 'string') {
        return res.status(400).json({ error: "Bad Request" });
    }

    const authHdr = req.headers.authorization;
    if (!authHdr) return res.status(400).json({ error: "Bad Request" });

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

    const user = await prisma.user.findUnique({
        where: { utorid: utorid }
    });

    if (!user) return res.status(404).json({ error: "Not Found" });

    const isGuest = event.guests.some(g => g.userId === user.id);
    if (isGuest) return res.status(400).json({ error: "Bad Request" });

    const inOrganizers = event.organizers.some(o => o.userId === user.id);
    if (inOrganizers) return res.status(400).json({ error: "Bad Request" });

    await prisma.eventOrganizer.create({
        data: {
            eventId: event.id,
            userId: user.id
        }
    });

    const updatedEvent = await prisma.event.findUnique({
        where: {id: eventId },
        include: {
            organizers: { include: { user: true } },
        }
    });

    return res.status(201).json({
        id: updatedEvent.id,
        name: updatedEvent.name,
        location: updatedEvent.location,
        organizers: updatedEvent.organizers.map(o => ({
            id: o.user.id,
            utorid: o.user.utorid,
            name: o.user.name
        }))
    })
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

    const isManagerOrSU = decoded.role === 'manager' || decoded.role === 'superuser';
    const isOrganizer = event.organizers.some(o => o.userId === userId);
    if (!isOrganizer) return res.status(404).json({ error: "Not Found" });

    if (!event.published && !isManagerOrSU) {
        return res.status(403).json({ error: "Forbidden" });
    }
    await prisma.eventOrganizer.deleteMany({
        where: { eventId, userId }
    });
    return res.status(204).send();   
});

module.exports = router;