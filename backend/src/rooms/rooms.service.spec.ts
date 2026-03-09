import { jest } from '@jest/globals'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { Room } from '@/prisma/client'
import { RoomsService } from './rooms.service'
import { PrismaService } from '../prisma/prisma.service'

const mockPrisma: {
	room: {
		findMany: jest.Mock<() => Promise<Room[]>>
		findUnique: jest.Mock<() => Promise<{ id: string } | null>>
	}
} = {
	room: {
		findMany: jest.fn(),
		findUnique: jest.fn(),
	},
}

describe('RoomsService', () => {
	let service: RoomsService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [RoomsService, { provide: PrismaService, useValue: mockPrisma }],
		}).compile()

		service = module.get(RoomsService)
		jest.clearAllMocks()
	})

	describe('resolveId', () => {
		it('returns roomId directly when provided', async () => {
			const result: string = await service.resolveId('room-uuid')
			expect(result).toBe('room-uuid')
			expect(mockPrisma.room.findUnique).not.toHaveBeenCalled()
		})

		it('looks up by roomName when roomId is not provided', async () => {
			mockPrisma.room.findUnique.mockResolvedValue({ id: 'room-uuid' })
			const result: string = await service.resolveId(undefined, 'Salle VN-5')
			expect(result).toBe('room-uuid')
		})

		it('throws NotFoundException when room name does not exist', async () => {
			mockPrisma.room.findUnique.mockResolvedValue(null)
			await expect(service.resolveId(undefined, 'Unknown Room')).rejects.toThrow(NotFoundException)
		})

		it('throws BadRequestException when neither roomId nor roomName is provided', async () => {
			await expect(service.resolveId()).rejects.toThrow(BadRequestException)
		})
	})
})
