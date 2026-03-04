import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter: PrismaPg = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma: PrismaClient = new PrismaClient({ adapter })

async function main(): Promise<void> {
	console.log('Seeding database...')

	// TODO: ajouter les seeds ici une fois les modèles définis

	console.log('Seeding complete.')
}

main()
	.catch((error: Error) => {
		console.error(error)
		process.exit(1)
	})
	.finally(() => {
		void prisma.$disconnect()
	})
