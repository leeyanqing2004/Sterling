const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function daysAgo(n) {
  return new Date(Date.now() - n * 86400000);
}

async function main() {
  console.log("Seeding database...");

  // -----------------------------------------------------
  // USERS (20)
  // -----------------------------------------------------
  const roles = ["regular", "cashier", "manager", "superuser"]; // Weighted

  const userData = [
    { utorid: "cashier01", name: "Cashier One", email: "cashier@mail.utoronto.ca", role: "cashier" },
    { utorid: "manager01", name: "Manager One", email: "manager@mail.utoronto.ca", role: "manager" },
    { utorid: "super01", name: "Super User", email: "super@mail.utoronto.ca", role: "superuser" },
  ];

  for (let i = 1; i <= 17; i++) {
    userData.push({
      utorid: `user${i}`,
      name: `User ${i}`,
      email: `user${i}@mail.utoronto.ca`,
      role: rand(roles),
      points: Math.floor(Math.random() * 2000),
    });
  }

  await prisma.user.createMany({ data: userData, skipDuplicates: true });
  const users = await prisma.user.findMany();

  // Helper: get random user
  const getUser = () => rand(users);

  // -----------------------------------------------------
  // EVENTS (20)
  // -----------------------------------------------------
  const eventData = [];
  for (let i = 1; i <= 20; i++) {
    const start = daysAgo(30 - i);
    const end = new Date(start.getTime() + 2 * 3600 * 1000);
    eventData.push({
      name: `Event ${i}`,
      description: `Description for event ${i}`,
      location: `Building ${i}, Room ${(i % 10) + 100}`,
      startTime: start,
      endTime: end,
      capacity: 100 + i,
      published: i % 2 === 0,
      pointsRemain: Math.floor(Math.random() * 500),
      pointsAwarded: Math.floor(Math.random() * 300),
    });
  }

  await prisma.event.createMany({ data: eventData, skipDuplicates: true });
  const events = await prisma.event.findMany();

  // -----------------------------------------------------
  // PROMOTIONS (20)
  // -----------------------------------------------------
  const promotionData = [];
  for (let i = 1; i <= 20; i++) {
    promotionData.push({
      name: `Promo ${i}`,
      description: `Promo description ${i}`,
      type: rand(["one-time", "automatic"]),
      startTime: daysAgo(40 - i),
      endTime: daysAgo(10 - i),
      minSpending: Math.random() > 0.5 ? Math.random() * 150 : null,
      rate: Math.random() > 0.5 ? Math.random() * 3 : null,
      points: Math.random() > 0.5 ? Math.floor(Math.random() * 100) : null,
    });
  }

  await prisma.promotion.createMany({ data: promotionData, skipDuplicates: true });
  const promotions = await prisma.promotion.findMany();

  // -----------------------------------------------------
  // TRANSACTIONS (20)
  // Each requires: createdById
  // Optional: senderId, recipientId, processedById
  // -----------------------------------------------------
  const types = ["purchase", "redeem", "transfer", "event"];
  const transactionData = [];

  for (let i = 1; i <= 20; i++) {
    const user = getUser();
    transactionData.push({
      utorid: user.utorid,
      type: rand(types),
      remark: `Transaction ${i} remark`,
      createdById: user.id,
      suspicious: Math.random() > 0.9,
      relatedId: null,
      amount: Math.floor(Math.random() * 300),
      spent: Math.floor(Math.random() * 200),
      earned: Math.floor(Math.random() * 150),
      senderId: Math.random() > 0.7 ? getUser().id : null,
      recipientId: Math.random() > 0.7 ? getUser().id : null,
      sent: Math.random() > 0.6 ? Math.floor(Math.random() * 20) : null,
      processed: Math.random() > 0.5,
      processedById: Math.random() > 0.5 ? getUser().id : null,
      redeemed: Math.random() > 0.6 ? Math.floor(Math.random() * 40) : null,
      awarded: Math.random() > 0.6 ? Math.floor(Math.random() * 50) : null,
      eventId: Math.random() > 0.7 ? rand(events).id : null,
    });
  }

  await prisma.transaction.createMany({ data: transactionData, skipDuplicates: true });
  const transactions = await prisma.transaction.findMany();

  // -----------------------------------------------------
  // EVENT ORGANIZERS (20)
  // -----------------------------------------------------
  const organizerData = [];
  for (let i = 1; i <= 20; i++) {
    organizerData.push({
      userId: getUser().id,
      eventId: rand(events).id,
    });
  }

  await prisma.eventOrganizer.createMany({ data: organizerData, skipDuplicates: true });

  // -----------------------------------------------------
  // EVENT GUESTS (20)
  // -----------------------------------------------------
  const guestData = [];
  for (let i = 1; i <= 20; i++) {
    guestData.push({
      userId: getUser().id,
      eventId: rand(events).id,
    });
  }

  await prisma.eventGuest.createMany({ data: guestData, skipDuplicates: true });

  // -----------------------------------------------------
  // RAFFLES (20)
  // -----------------------------------------------------
  const raffleData = [];
  for (let i = 1; i <= 20; i++) {
    raffleData.push({
      name: `Raffle ${i}`,
      description: `Raffle description ${i}`,
      pointCost: Math.floor(Math.random() * 100 + 10),
      prizePoints: Math.floor(Math.random() * 500 + 50),
      startTime: daysAgo(20 + i),
      endTime: daysAgo(i),
      drawTime: daysAgo(i - 1),
      winnerId: Math.random() > 0.7 ? getUser().id : null,
      drawn: Math.random() > 0.6,
    });
  }

  await prisma.raffle.createMany({ data: raffleData, skipDuplicates: true });
  const raffles = await prisma.raffle.findMany();

  // -----------------------------------------------------
  // RAFFLE ENTRIES (20)
  // -----------------------------------------------------
  const raffleEntryData = [];
  for (let i = 1; i <= 20; i++) {
    raffleEntryData.push({
      raffleId: rand(raffles).id,
      userId: getUser().id,
      enteredAt: daysAgo(i),
    });
  }

  await prisma.raffleEntry.createMany({ data: raffleEntryData, skipDuplicates: true });

  console.log("Seed completed successfully!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err);
    prisma.$disconnect();
    process.exit(1);
  });
