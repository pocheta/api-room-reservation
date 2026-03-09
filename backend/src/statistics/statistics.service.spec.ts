import { jest } from '@jest/globals'
import { Test, TestingModule } from '@nestjs/testing'
import { Reservation, ReservationStatus, Room } from '@/prisma/client'
import { AverageDurationStats, OccupancyPeriod, OccupancyStats, RoomReservationCount, TopRoom } from '@/types'
import { StatisticsService } from './statistics.service'
import { ReservationsService } from '@/reservations/reservations.service'
import { RoomsService } from '@/rooms/rooms.service'

const mockRoom: Room = {
	id: 'room-1',
	name: 'Salle A',
	capacity: 10,
	description: null,
	createdAt: new Date(),
	updatedAt: new Date(),
}

const mockRoomsService: {
	findAll: jest.Mock<() => Promise<Room[]>>
	findRoomsByIds: jest.Mock<() => Promise<Room[]>>
} = {
	findAll: jest.fn(),
	findRoomsByIds: jest.fn(),
}

const mockReservationsService: {
	findConfirmedInPeriod: jest.Mock<() => Promise<Reservation[]>>
	findAllConfirmed: jest.Mock<() => Promise<Reservation[]>>
	findConfirmedGroupedByRoom: jest.Mock<() => Promise<RoomReservationCount[]>>
} = {
	findConfirmedInPeriod: jest.fn(),
	findAllConfirmed: jest.fn(),
	findConfirmedGroupedByRoom: jest.fn(),
}

describe('StatisticsService', () => {
	let service: StatisticsService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				StatisticsService,
				{ provide: RoomsService, useValue: mockRoomsService },
				{ provide: ReservationsService, useValue: mockReservationsService },
			],
		}).compile()

		service = module.get(StatisticsService)
		jest.clearAllMocks()
	})

	describe('getAverageDuration', () => {
		it('returns 0 when there are no confirmed reservations', async () => {
			mockReservationsService.findAllConfirmed.mockResolvedValue([])
			const result: AverageDurationStats = await service.getAverageDuration()
			expect(result).toEqual({ averageDurationMinutes: 0 })
		})

		it('computes the correct average duration in minutes', async () => {
			mockReservationsService.findAllConfirmed.mockResolvedValue([
				{
					startTime: new Date('2026-01-01T09:00:00Z'),
					endTime: new Date('2026-01-01T10:00:00Z'),
					status: ReservationStatus.CONFIRMED,
				} as Reservation,
				{
					startTime: new Date('2026-01-01T14:00:00Z'),
					endTime: new Date('2026-01-01T15:30:00Z'),
					status: ReservationStatus.CONFIRMED,
				} as Reservation,
			])
			const result: AverageDurationStats = await service.getAverageDuration()
			expect(result.averageDurationMinutes).toBe(75)
		})
	})

	describe('getTopRooms', () => {
		it('returns rooms ranked by reservation count', async () => {
			mockReservationsService.findConfirmedGroupedByRoom.mockResolvedValue([
				{ roomId: 'room-1', reservationCount: 5 },
				{ roomId: 'room-2', reservationCount: 3 },
			])
			mockRoomsService.findRoomsByIds.mockResolvedValue([
				{ id: 'room-1', name: 'Salle A' } as Room,
				{ id: 'room-2', name: 'Salle B' } as Room,
			])

			const result: TopRoom[] = await service.getTopRooms(2)

			expect(result).toHaveLength(2)
			expect(result[0]).toMatchObject({ rank: 1, roomName: 'Salle A', reservationCount: 5 })
			expect(result[1]).toMatchObject({ rank: 2, roomName: 'Salle B', reservationCount: 3 })
		})

		it('returns empty array when no reservations exist', async () => {
			mockReservationsService.findConfirmedGroupedByRoom.mockResolvedValue([])
			mockRoomsService.findRoomsByIds.mockResolvedValue([])

			const result: TopRoom[] = await service.getTopRooms(3)
			expect(result).toEqual([])
		})
	})

	describe('getOccupancy', () => {
		it('returns 0% occupancy when no reservations exist for the period', async () => {
			mockRoomsService.findAll.mockResolvedValue([mockRoom])
			mockReservationsService.findConfirmedInPeriod.mockResolvedValue([])

			const result: OccupancyStats = await service.getOccupancy(OccupancyPeriod.daily)

			expect(result.period).toBe(OccupancyPeriod.daily)
			expect(result.rooms[0].occupancyRate).toBe(0)
		})

		it('clips reservations that extend beyond the period boundaries', async () => {
			const now: Date = new Date()
			const dayStart: Date = new Date(now)
			dayStart.setHours(0, 0, 0, 0)
			const dayEnd: Date = new Date(now)
			dayEnd.setHours(23, 59, 59, 999)

			const reservationStart: Date = new Date(dayStart.getTime() - 1000 * 60 * 60)
			const reservationEnd: Date = new Date(dayStart.getTime() + 1000 * 60 * 60)

			mockRoomsService.findAll.mockResolvedValue([mockRoom])
			mockReservationsService.findConfirmedInPeriod.mockResolvedValue([
				{
					roomId: 'room-1',
					startTime: reservationStart,
					endTime: reservationEnd,
					status: ReservationStatus.CONFIRMED,
				} as Reservation,
			])

			const result: OccupancyStats = await service.getOccupancy(OccupancyPeriod.daily)
			const occupancy: number = result.rooms[0].occupancyRate

			void dayEnd
			expect(occupancy).toBeGreaterThan(0)
			expect(occupancy).toBeLessThan(100)
		})

		it('includes from/to dates in the response', async () => {
			mockRoomsService.findAll.mockResolvedValue([])
			mockReservationsService.findConfirmedInPeriod.mockResolvedValue([])

			const result: OccupancyStats = await service.getOccupancy(OccupancyPeriod.weekly)
			expect(result.from).toBeInstanceOf(Date)
			expect(result.to).toBeInstanceOf(Date)
			expect(result.to.getTime()).toBeGreaterThan(result.from.getTime())
		})
	})
})
