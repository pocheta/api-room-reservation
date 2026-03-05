"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./generated/prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const bcryptjs_1 = require("bcryptjs");
const fr_1 = require("@faker-js/faker/locale/fr");
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new client_1.PrismaClient({ adapter });
async function insertUser(password) {
    return prisma.user.create({
        data: {
            email: fr_1.faker.internet.email().toLowerCase(),
            password,
            firstname: fr_1.faker.person.firstName(),
            lastname: fr_1.faker.person.lastName(),
        },
    });
}
async function insertRoom(index) {
    const name = `Salle ${fr_1.faker.string.alpha({ length: 2, casing: 'upper' })}-${index + 1}`;
    return prisma.room.upsert({
        where: { name },
        update: {},
        create: {
            name,
            capacity: fr_1.faker.number.int({ min: 2, max: 20 }),
            description: fr_1.faker.lorem.sentence(),
        },
    });
}
function nextWorkdays(count) {
    const days = [];
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    while (days.length < count) {
        cursor.setDate(cursor.getDate() + 1);
        const day = cursor.getDay();
        if (day !== 0 && day !== 6) {
            days.push(new Date(cursor));
        }
    }
    return days;
}
function buildReservation(day, users, rooms) {
    const startHour = fr_1.faker.number.int({ min: 8, max: 17 });
    const duration = fr_1.faker.number.int({ min: 1, max: 3 });
    const startTime = new Date(day);
    startTime.setHours(startHour, 0, 0, 0);
    const endTime = new Date(day);
    endTime.setHours(startHour + duration, 0, 0, 0);
    return {
        title: fr_1.faker.company.buzzPhrase(),
        startTime,
        endTime,
        status: client_1.ReservationStatus.CONFIRMED,
        userId: fr_1.faker.helpers.arrayElement(users).id,
        roomId: fr_1.faker.helpers.arrayElement(rooms).id,
    };
}
async function main() {
    const users = await Promise.all(Array.from({ length: 5 }, async (_, index) => {
        const password = await (0, bcryptjs_1.hash)(`password${index}`, 10);
        return insertUser(password);
    }));
    const rooms = await Promise.all(Array.from({ length: 8 }, (_, index) => insertRoom(index)));
    const workdays = nextWorkdays(10);
    const reservations = workdays.map((day) => buildReservation(day, users, rooms));
    await prisma.reservation.createMany({ data: reservations });
    console.log(`Seeded ${users.length} users, ${rooms.length} rooms, ${reservations.length} reservations.`);
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map