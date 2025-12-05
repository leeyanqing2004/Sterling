'use strict';

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const router = express.Router();

const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET;
const lastRequestTimes = {};

/*
 * POST /auth/tokens
 * Authenticates a user and generates a JWT token.
 * Clearance: Any
 */
router.all('/tokens', async (req, res) => {
    // 405 Method Not Allowed
    if (req.method !== "POST") {
        return res.status(405).send({ error: "Method Not Allowed" });
    }

    // 400 Bad Request 

    // Check for extra fields
    const keys = Object.keys(req.body);
    const allowedKeys = ['utorid', 'password'];
    const unknownKeys = keys.filter(key => !allowedKeys.includes(key));
    if (unknownKeys.length > 0) {
        return res.status(400).json({ error: `Unknown field(s): ${unknownKeys.join(', ')}` });
    }

    const { utorid, password } = req.body;

    // Check for missing fields
    if (!utorid) {
        return res.status(400).json({ error: 'Utorid is required' });
    }
    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    const user = await prisma.user.findUnique({ where: { utorid } });

    // 404 Not Found 
    if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Your Utorid or password is wrong.' });
    }

    // Create JWT payload
    const payload = {
        id: user.id,
        utorid: user.utorid,
        role: user.role
    };

    // Generate JWT token that expires in 1 day
    const token = jwt.sign(payload, secret, { expiresIn: '1d' });
    const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000));

    // Update last login time
    await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
    });

    // 200 OK
    return res.status(200).json({ token, expiresAt });
});

/* POST auth/resets */
router.all("/resets", async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).send({ error: "Method Not Allowed" });
    }

    const keys = Object.keys(req.body);
    if (keys[0] !== "utorid" || keys.length !== 1) {
        return res.status(400).send({ error: "Bad Request" });
    }

    const { utorid } = req.body;
    if (typeof utorid !== "string") {
        return res.status(400).send({ error: "Bad Request" });
    }

    const user = await prisma.user.findUnique({
        where: {
            utorid: utorid
        }
    });

    if (!user) {
        return res.status(404).send({ error: "Not Found" });
    }

    const ip = req.ip;
    const now = new Date();
    if (lastRequestTimes[ip] && now - lastRequestTimes[ip] < 60 * 1000) {
        return res.status(429).send({ error: "Too Many Requests" });
    }
    lastRequestTimes[ip] = now;

    const uuid = require('uuid');
    const resetToken = uuid.v4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.user.update({
        where: { utorid: utorid },
        data: {
            resetToken: resetToken,
            expiresAt: expiresAt
        }
    });

    return res.status(202).send({ expiresAt, resetToken });
});

// Helper function for the /auth/resets/:resetToken endpoint
function isValidPassword(password) {
    var hasLower = false;
    var hasUpper = false;
    var hasNumber = false;
    var hasSpecial = false;

    let outcomeMessage = "Valid password entered.";
    
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

    if (!hasLower) {outcomeMessage = "Password must contain at least one lowercase letter."}
    if (!hasUpper) {outcomeMessage = "Password must contain at least one uppercase letter."}
    if (!hasNumber) {outcomeMessage = "Password must contain at least one number."}
    if (!hasSpecial) {outcomeMessage = "Password must contain at least one special character."}
    if (password.length < 8 || password.length > 20) {outcomeMessage = "Password must contain 8-20 characters."}

    const isValid = hasLower && hasUpper && hasNumber && hasSpecial && password.length >= 8 && password.length <= 20;

    return { isValid, message: outcomeMessage };
}

// POST /auth/resets/:resetToken
router.all("/resets/:resetToken", async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).send({ error: "Method Not Allowed" });
    }
    console.log("Headers:", req.headers);

    // const keys = Object.keys(req.body);
    // if (keys[0] !== "utorid" || keys[1] !== "password" || keys.length !== 2) {
    //     return res.status(400).send({ error: "Bad Request" });
    // }

    const keys = Object.keys(req.body);
    console.log(`keys = ${keys}`)
    if (keys.length !== 2 || !keys.includes("utorid") || !keys.includes("password")) {
        return res.status(400).send({ error: "Bad Request" });
    }

    const { utorid, password } = req.body;
    if (typeof utorid !== "string" || typeof password !== "string") {
        return res.status(400).send({ error: "Bad Request" });
    }

    const { resetToken } = req.params;
    if (!resetToken || typeof resetToken !== "string") {
        return res.status(400).json({ error: 'Bad Request' });
    }

    const user = await prisma.user.findUnique({
        where: { resetToken },
    });

    if (!user) {
        return res.status(404).json({ error: 'Not Found' });
    }

    if (user.utorid !== utorid) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const now = new Date();
    if (now > user.expiresAt) {
        return res.status(410).json({ error: 'Gone' });
    }

    const validPass = isValidPassword(password);

    if (!validPass.isValid) {
        return res.status(400).json({ error: validPass.message });
    }

    await prisma.user.update({
        where: { utorid },
        data: {
        password,
        resetToken: null,
        expiresAt: null,
        },
    });

    return res.status(200).json({});
});

module.exports = router;