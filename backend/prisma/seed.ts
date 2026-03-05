import { PrismaClient, ReservationStatus, User, Room, Prisma } from '@/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'
import { faker } from '@faker-js/faker/locale/fr'

const adapter: PrismaPg = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma: PrismaClient = new PrismaClient({ adapter })


async function insertUser(password: string): Promise<User> {
    return prisma.user.create({
        data: {
            email: faker.internet.email().toLowerCase(),
            password,
            firstname: faker.person.firstName(),
            lastname: faker.person.lastName(),
        },
    })
}

async function insertRoom(index: number): Promise<Room> {
    const name: string = `Salle ${faker.string.alpha({ length: 2, casing: 'upper' })}-${index + 1}`
    return prisma.room.upsert({
        where: { name },
        update: {},
        create: {
            name,
            capacity: faker.number.int({ min: 2, max: 20 }),
            description: faker.lorem.sentence(),
        },
    })
}

function nextWorkdays(count: number): Date[] {
    const days: Date[] = []
    const cursor: Date = new Date()
    cursor.setHours(0, 0, 0, 0)

    while (days.length < count) {
        cursor.setDate(cursor.getDate() + 1)
        const day: number = cursor.getDay()
        if (day !== 0 && day !== 6) {
            days.push(new Date(cursor))
        }
    }

    return days
}

function buildReservation(day: Date, users: User[], rooms: Room[]): Prisma.ReservationCreateManyInput {
    const startHour: number = faker.number.int({ min: 8, max: 17 })
    const duration: number = faker.number.int({ min: 1, max: 3 })

    const startTime: Date = new Date(day)
    startTime.setHours(startHour, 0, 0, 0)

    const endTime: Date = new Date(day)
    endTime.setHours(startHour + duration, 0, 0, 0)

    return {
        title: faker.company.buzzPhrase(),
        startTime,
        endTime,
        status: ReservationStatus.CONFIRMED,
        userId: faker.helpers.arrayElement(users).id,
        roomId: faker.helpers.arrayElement(rooms).id,
    }
}

async function main(): Promise<void> {
    const users: User[] = await Promise.all(
		Array.from({ length: 5 }, async (_: unknown, index: number): Promise<User> => {
			const password: string = await hash(`password${index}`, 10)
			return insertUser(password)
		}),
	)

    const rooms: Room[] = await Promise.all(
		Array.from({ length: 8 }, (_: unknown, index: number): Promise<Room> => insertRoom(index)),
	)

    const workdays: Date[] = nextWorkdays(10)
    const reservations: Prisma.ReservationCreateManyInput[] = workdays.map(
        (day: Date): Prisma.ReservationCreateManyInput => buildReservation(day, users, rooms),
    )
    await prisma.reservation.createMany({ data: reservations })

    console.log(`Seeded ${users.length} users, ${rooms.length} rooms, ${reservations.length} reservations.`)
}

main()
    .catch((error: Error) => {
        console.error(error)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
