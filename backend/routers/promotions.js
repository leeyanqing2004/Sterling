const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const router = express.Router();

const prisma = new PrismaClient();

function cleared(role, requiredRole) {
    const clearanceLevelsByIndex = ['regular', 'cashier', 'manager', 'superuser'];
    const curRoleLevel = clearanceLevelsByIndex.indexOf(role);
    const requiredLevel = clearanceLevelsByIndex.indexOf(requiredRole);
    
    return curRoleLevel >= requiredLevel;
}

/* GET & POST /promotions */
router.all("/", async (req, res) => {
    if (req.method === "GET") {
        let { name, type, page = 1, limit = 10, started, ended } = req.query;
        const where = {};
        if (name) {
            where.name = { contains: name };
        }

        if (type) {
            where.type = { contains: type };
        }

        page = parseInt(page) || 1;
        if (page < 1) {
            return res.status(400).send({ error: "Page must be greater than 0." });
        }

        limit = parseInt(limit) || 10;
        if (limit < 1) {
            return res.status(400).send({ error: "Limit must be greater than 0." });
        }
        
        const now = new Date();
        const authHdr = req.headers.authorization;
        if (!authHdr) {
            return res.status(400).json({ error: "Bad Request"});
        }

        const token = authHdr.split(' ')[1];
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (decoded.role === "manager" || decoded.role === "superuser") {
            const role = req.auth.role;

            if (!role) {
                return res.status(401).json({error: 'Unauthorized'});
            }

            if (cleared(role, "manager") === false) {
                return res.status(403).json({error: 'Forbidden'});
            }

            if (started && ended) {
                return res.status(400).send({ error: "Cannot filter by both started and ended." });
            }

            if (started === "true") {
                where.startTime = { lte: now };
            } else if (started === "false") {
                where.startTime = { gt: now };
            } else if (ended === "true") {
                where.endTime = { lte: now };
            } else {
                where.endTime = { gt: now };
            }
            
        } else {
            // Regular/Cashier: only currently active promotions (started and not yet ended)
            where.startTime = { lte: now };
            where.endTime = { gte: now };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);
        const [count, results] = await Promise.all([
            prisma.promotion.count({ where }),
            prisma.promotion.findMany({
                where,
                skip,
                take,
                orderBy: { endTime : 'asc' },
                select: {
                    id: true,
                    name: true,
                    type: true,
                    startTime: true,
                    endTime: true,
                    minSpending: true,
                    rate: true,
                    points: true
                }
            })
        ]);
        res.json({ count, results });
    } else if (req.method === "POST") {
        const role = req.auth.role;

        if (!role) {
            return res.status(401).json({error: 'Unauthorized'});
        }
        
        if (cleared(role, "manager") === false) {
            return res.status(403).json({error: 'Forbidden'});
        }

        let { 
            name, 
            description, 
            type, 
            startTime, 
            endTime, 
            ...rest
        } = req.body

        if (name === undefined || name === null || name === "") {
            return res.status(400).send({ error: "Name is required." });
        }

        if (description === undefined || description === null || description === "") {
            return res.status(400).send({ error: "Description is required." });
        }

        const allowedTypes = ["automatic", "onetime", "one-time"];
        if (type === undefined || type === null || !allowedTypes.includes(type)) {
            return res.status(400).send({ error: "Type must be either 'automatic' or 'one-time'." });
        }

        if (startTime === undefined || startTime === null) {
            return res.status(400).send({ error: "Start time is required." });
        }

        if (endTime === undefined || endTime === null) {
            return res.status(400).send({ error: "End time is required." });
        }

        if (endTime < startTime) {
            return res.status(400).send({ error: "Start time must be before end time." });
        }

        for (const key of Object.keys(rest)) {
            const value = rest[key];
            if (value !== undefined && value !== null) {
                if (key === "minSpending") {
                    if (value < 0) {
                        return res.status(400).send({ error: "Min spending must be greater than 0." });
                    } 
                } else if (key === "rate") {
                    if (value < 0) {
                        return res.status(400).send({ error: "Rate must be greater than 0." });
                    } 
                } else if (key === "points") {
                    if (value < 0) {
                        return res.status(400).send({ error: "Points must be greater than 0." });
                    } 
                } else {
                    return res.status(400).send({ error: "Bad Request" });
                }
            }
        }

        type = type === "one-time" ? "onetime" : type;
        const data = { name, description, type, startTime, endTime, ...rest };
        const newPromotion = await prisma.promotion.create({ data: data });
        return res.status(201).json(newPromotion);
    } else {
        return res.status(405).send({ error: "Method Not Allowed" });
    }
});

router.all("/:promotionId", async (req, res) => {
    if (req.method === "GET") {
        const role = req.auth.role;
        
        if (!role) {
            return res.status(401).json({error: 'Unauthorized'});
        }

        if (cleared(role, "regular") === false) {
            return res.status(403).json({error: 'Forbidden'});
        }

        const id = parseInt(req.params.promotionId);
        if (isNaN(id)) {
            return res.status(400).json({ error: "Bad Request" });
        }

        const promotion = await prisma.promotion.findUnique({
            where: {
                id: id
            }
        });

        if (!promotion) {
            return res.status(404).json({ error: "Promotion not found." });
        }

        if (role === "manager" || role === "superuser") {
            return res.status(200).json({
                id: promotion.id,
                name: promotion.name,
                description: promotion.description,
                type: promotion.type,
                startTime: promotion.startTime,
                endTime: promotion.endTime,
                minSpending: promotion.minSpending,
                rate: promotion.rate,
                points: promotion.points
            });
        }

        const now = new Date();
        if (promotion.startTime <= now && promotion.endTime >= now) {
            return res.status(200).json({
                id: promotion.id,
                name: promotion.name,
                description: promotion.description,
                type: promotion.type,
                startTime: promotion.startTime,
                endTime: promotion.endTime,
                minSpending: promotion.minSpending,
                rate: promotion.rate,
                points: promotion.points
            });
        } else {
            return res.status(404).json({ error: "Promotion not found." });
        }
    } else if (req.method === "PATCH") {
        const role = req.auth.role;

        if (!role) {
            return res.status(401).json({error: 'Unauthorized'});
        }

        if (cleared(role, "manager") === false) {
            return res.status(403).json({error: 'Forbidden'});
        }

        const id = parseInt(req.params.promotionId);
        if (isNaN(id)) {
            return res.status(400).json({ error: "Bad Request" });
        }

        const promotion = await prisma.promotion.findUnique({
            where: {
                id: id
            }
        });

        if (!promotion) {
            return res.status(404).json({ error: "Not Found" });
        }

        const data = {};
        for (const key of Object.keys(req.body)) {
            const value = req.body[key];
            if (value !== null) {
                if (key === "name") {
                    if (typeof value !== "string" || value === "") {
                        return res.status(400).send({ error: "Name is required." });
                    }
                } else if (key === "description") {
                    if (typeof value !== "string" || value === "") {
                        return res.status(400).send({ error: "Description is required." });
                    }
                } else if (key === "type") {
                    if (typeof value !== "string") {
                        return res.status(400).send({ error: "Bad Request" });
                    }

                    const allowedTypes = ["automatic", "onetime", "one-time"];
                    if (!allowedTypes.includes(value)) {
                        return res.status(400).send({ error: "Type must be either 'automatic' or 'one-time'." });
                    }
                } else if (key === "startTime") {
                    if (typeof value !== "string") {
                        return res.status(400).send({ error: "Bad Request" });
                    }

                    const now = new Date();
                    if (new Date(value) < now) {
                        return res.status(400).send({ error: "Start time must be in the future." });
                    }
                } else if (key === "endTime") {
                    if (typeof value !== "string") {
                        return res.status(400).send({ error: "Bad Request" });
                    }

                    const now = new Date();
                    if (new Date(value) < now) {
                        return res.status(400).send({ error: "End time must be in the future." });
                    }
                } else if (key === "minSpending") {
                    if (typeof value !== "number" || value <= 0) {
                        return res.status(400).send({ error: "Min spending must be greater than 0." });
                    }
                } else if (key === "rate") {
                    if (typeof value !== "number" || value <= 0) {
                        return res.status(400).send({ error: "Rate must be greater than 0." });
                    }
                } else if (key === "points") {
                    if (!Number.isInteger(value) || value <= 0) {
                        return res.status(400).send({ error: "Points must be greater than 0." });
                    }
                } else {
                    return res.status(400).send({ error: "Bad Request" });
                }
                data[key] = value;
            }
        }
        const updatedPromotion = await prisma.promotion.update({
            where: {
                id: id
            },
            data: data
        });

        return res.status(200).json({
            id: updatedPromotion.id,
            name: updatedPromotion.name,
            type: updatedPromotion.type,
            ...Object.fromEntries(
                Object.entries(data).filter(([k]) => {
                    return k !== "name" && k !== "type"
                })
            )
        });
    } else if (req.method === "DELETE") {
        const role = req.auth.role;

        if (!role) {
            return res.status(401).json({error: 'Unauthorized'});
        }

        if (cleared(role, "manager") === false) {
            return res.status(403).json({error: 'Forbidden'});
        }
        
        const id = parseInt(req.params.promotionId);
        if (isNaN(id)) {
            return res.status(400).json({ error: "Bad Request" });
        }

        const promotion = await prisma.promotion.findUnique({
            where: {
                id: id
            }
        });

        if (!promotion) {
            return res.status(404).json({ error: "Not Found" });
        }

        const now = new Date();
        if (promotion.startTime <= now) {
            return res.status(403).json({ error: "Forbidden" });
        }

        await prisma.promotion.delete({
            where: {
                id: id
            }
        });
        res.status(204).send();
    } else {
        return res.status(405).send({ error: "Method Not Allowed" });
    }
});

module.exports = router;
