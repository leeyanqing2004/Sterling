/*
 * Complete this script so that it is able to add a superuser to the database
 * Usage example: 
 *   node prisma/createsu.js clive123 clive.su@mail.utoronto.ca SuperUser123!
 */
'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const args = process.argv;
    if (args.length !== 5) {
        console.error("usage: node prisma/createsu.js <utorid> <email> <password>");
        process.exit(1);
    }

    const [ , , utorid, email, password] = args

    try {
        const superuser = await prisma.user.create({
            data: {
                utorid: utorid,
                email: email,
                name: "Super User",
                password: password,
                role: 'superuser',
                verified: true
            }
        });

        console.log("Superuser successfully created:", superuser);
    } catch (err) {
        console.error("error: failed to create superuser", err);
    } finally {
        await prisma.$disconnect();
    }
}


main().catch(err => {
  console.error(err);
  process.exit(1);
});