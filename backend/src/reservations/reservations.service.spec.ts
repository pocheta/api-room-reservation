import { jest } from '@jest/globals'
import { ForbiddenException, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { Reservation, ReservationStatus } from '@/prisma/client'
import { ReservationResponse, RoomReservationCount } from '@/types'
import { ReservationsService } from './reservations.service'
import { PrismaService } from '../prisma/prisma.service'
import { RoomsService } from '@/rooms/rooms.service'

const FUTURE_START: Date = new Date(Date.now() + 1000 * 60 * 60)
const FUTURE_END: Date = new Date(Date.now() + 1000 * 60 * 120)
const PAST_DATE: Date = new Date(Date.now() - 1000 * 60 * 60)

const mockReservation: Reservation = {
	id: 'res-uuid',
	title: 'Meeting',
	startTime: FUTURE_START,
	endTime: FUTURE_END,
	status: ReservationStatus.CONFIRMED,
	roomId: 'room-uuid',
	userId: 'user-uuid',
	createdAt: new Date(),
	updatedAt: new Date(),
}

const mockTx: {
	reservation: {
		findUnique: jest.Mock<() => Promise<Reservation | null>>
		findFirst: jest.Mock<() => Promise<Reservation | null>>
		create: jest.Mock<() => Promise<Reservation>>
		update: jest.Mock<() => Promise<Reservation>>
	}
} = {
	reservation: {
		findUnique: jest.fn(),
		findFirst: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
	},
}

const mockPrisma: {
	reservation: {
		findMany: jest.Mock<() => Promise<Reservation[]>>
		groupBy: jest.Mock<() => Promise<RoomReservationCount[]>>
	}
	$transaction: jest.Mock<(fn: (tx: typeof mockTx) => Promise<Reservation>) => Promise<Reservation>>
} = {
	reservation: {
		findMany: jest.fn(),
		groupBy: jest.fn(),
	},
	$transaction: jest.fn((fn: (tx: typeof mockTx) => Promise<Reservation>) => fn(mockTx)),
}

const mockRoomsService: { resolveId: jest.Mock<() => Promise<string>> } = {
	resolveId: jest.fn(),
}

describe('ReservationsService', () => {
	let service: ReservationsService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ReservationsService,
				{ provide: PrismaService, useValue: mockPrisma },
				{ provide: RoomsService, useValue: mockRoomsService },
			],
		}).compile()

		service = module.get(ReservationsService)
		jest.clearAllMocks()
	})

	describe('create', () => {
		it('creates a reservation successfully', async () => {
			mockRoomsService.resolveId.mockResolvedValue('room-uuid')
			mockTx.reservation.findFirst.mockResolvedValue(null)
			mockTx.reservation.create.mockResolvedValue(mockReservation)

			const result: ReservationResponse = await service.create('user-uuid', {
				title: 'Meeting',
				startTime: FUTURE_START.toISOString(),
				endTime: FUTURE_END.toISOString(),
				roomId: 'room-uuid',
			})

			expect(result.title).toBe('Meeting')
			expect(mockTx.reservation.create).toHaveBeenCalledTimes(1)
		})

		it('throws UnprocessableEntityException when start is in the past', async () => {
			await expect(
				service.create('user-uuid', {
					title: 'Meeting',
					startTime: PAST_DATE.toISOString(),
					endTime: FUTURE_END.toISOString(),
					roomId: 'room-uuid',
				}),
			).rejects.toThrow(UnprocessableEntityException)
		})

		it('throws UnprocessableEntityException when end is before start', async () => {
			await expect(
				service.create('user-uuid', {
					title: 'Meeting',
					startTime: FUTURE_END.toISOString(),
					endTime: FUTURE_START.toISOString(),
					roomId: 'room-uuid',
				}),
			).rejects.toThrow(UnprocessableEntityException)
		})

		it('throws UnprocessableEntityException when room is unavailable', async () => {
			mockRoomsService.resolveId.mockResolvedValue('room-uuid')
			mockTx.reservation.findFirst.mockResolvedValue(mockReservation)

			await expect(
				service.create('user-uuid', {
					title: 'Meeting',
					startTime: FUTURE_START.toISOString(),
					endTime: FUTURE_END.toISOString(),
					roomId: 'room-uuid',
				}),
			).rejects.toThrow(UnprocessableEntityException)
		})
	})

	describe('update', () => {
		it('throws ForbiddenException when user is not the owner', async () => {
			mockTx.reservation.findUnique.mockResolvedValue({ ...mockReservation, userId: 'other-user' })

			await expect(
				service.update('user-uuid', 'res-uuid', { title: 'Updated' }),
			).rejects.toThrow(ForbiddenException)
		})

		it('throws UnprocessableEntityException when reservation is already cancelled', async () => {
			mockTx.reservation.findUnique.mockResolvedValue({
				...mockReservation,
				status: ReservationStatus.CANCELLED,
			})

			await expect(
				service.update('user-uuid', 'res-uuid', { title: 'Updated' }),
			).rejects.toThrow(UnprocessableEntityException)
		})

		it('throws NotFoundException when reservation does not exist', async () => {
			mockTx.reservation.findUnique.mockResolvedValue(null)

			await expect(
				service.update('user-uuid', 'res-uuid', { title: 'Updated' }),
			).rejects.toThrow(NotFoundException)
		})
	})

	describe('remove', () => {
		it('cancels a reservation successfully', async () => {
			mockTx.reservation.findUnique.mockResolvedValue(mockReservation)
			mockTx.reservation.update.mockResolvedValue({ ...mockReservation, status: ReservationStatus.CANCELLED })

			await service.remove('user-uuid', 'res-uuid')

			expect(mockTx.reservation.update).toHaveBeenCalledWith({
				where: { id: 'res-uuid' },
				data: { status: ReservationStatus.CANCELLED },
			})
		})

		it('throws ForbiddenException when user is not the owner', async () => {
			mockTx.reservation.findUnique.mockResolvedValue({ ...mockReservation, userId: 'other-user' })

			await expect(service.remove('user-uuid', 'res-uuid')).rejects.toThrow(ForbiddenException)
		})
	})
})
