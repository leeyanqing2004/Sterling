#!/usr/bin/env node
'use strict';

// import dotenv from "dotenv";
// import cors from "cors";
// dotenv.config();

// require('dotenv').config(); // For JWT secret
const express = require("express");
const { expressjwt: jwtMiddleware } = require('express-jwt');
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();


const port = (() => {
    const args = process.argv;

    if (args.length !== 3) {
        console.error("usage: node index.js port");
        process.exit(1);
    }

    const num = parseInt(args[2], 10);
    if (isNaN(num)) {
        console.error("error: argument must be an integer.");
        process.exit(1);
    }

    return num;
})();

// Use CORS to ensure frontend url is allowed to access backend
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

var corsOptions = {
    origin: FRONTEND_URL,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions))
app.use(express.json());
app.use(express.static('public')); // allows you to see uploaded avatars in browser

// Middleware to authenticate JWT tokens
app.use(
    jwtMiddleware({
        secret: process.env.JWT_SECRET,
        algorithms: ['HS256']
    }).unless({
        path: [
            '/auth/tokens',
            '/auth/resets',
            '/users/new',
            { url: /^\/auth\/resets\/.*/, methods: ['POST'] }
        ]
    })
);

// Import user router
const userRoutes = require('./routers/users');
app.use('/users', userRoutes);

// Import auth router
const authRoutes = require('./routers/auth');
app.use('/auth', authRoutes);

// Import promotions router
const promotionRoutes = require('./routers/promotions')
app.use('/promotions', promotionRoutes);

// Import events router
const eventsRoutes = require('./routers/events');
app.use('/events', eventsRoutes);

// Import transactions router
const transactionRoutes = require('./routers/transactions');
app.use('/transactions', transactionRoutes);

const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

server.on('error', (err) => {
    console.error(`cannot start server: ${err.message}`);
    process.exit(1);
});