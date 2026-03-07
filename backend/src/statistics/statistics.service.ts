import { Injectable } from '@nestjs/common'
import { Reservation, Room } from '@/prisma/client'
import {
	AverageDurationStats,
	OccupancyPeriod,
	OccupancyStats,
	RoomOccupancy,
	RoomReservationCount,
	TopRoom,
} from '@/types'
import { ReservationsService } from '@/reservations/reservations.service'
import { RoomsService } from '@/rooms/rooms.service'
import { StatisticsMapper } from './statistics.mapper'

type PeriodRangeForOccupancy = {
	start: Date
	end: Date
	totalMinutes: number
}

@Injectable()
export class StatisticsService {
	constructor(
		private readonly roomsService: RoomsService,
		private readonly reservationsService: ReservationsService,
	) {}

	async getOccupancy(period: OccupancyPeriod): Promise<OccupancyStats> {
		const periodRange: PeriodRangeForOccupancy = this.getPeriodRange(period)

		const [rooms, reservations]: [Room[], Reservation[]] = await Promise.all([
			this.roomsService.findAll(),
			this.reservationsService.findConfirmedInPeriod(periodRange.start, periodRange.end),
		])

		return {
			period,
			from: periodRange.start,
			to: periodRange.end,
			rooms: rooms.map(
				(room: Room): RoomOccupancy => this.calculateRoomOccupancy(periodRange, room, reservations),
			),
		}
	}

	async getTopRooms(limit: number): Promise<TopRoom[]> {
		const grouped: RoomReservationCount[] = await this.reservationsService.findConfirmedGroupedByRoom(limit)

		const roomIds: string[] = grouped.map((g: RoomReservationCount): string => g.roomId)
		const rooms: Room[] = await this.roomsService.findRoomsByIds(roomIds)
		const roomMap: Map<string, string> = StatisticsMapper.buildRoomMap(rooms)

		return grouped.map(
			(g: RoomReservationCount, index: number): TopRoom => StatisticsMapper.toTopRoom(g, roomMap, index + 1),
		)
	}

	async getAverageDuration(): Promise<AverageDurationStats> {
		const reservations: Reservation[] = await this.reservationsService.findAllConfirmed()

		if (reservations.length === 0) return { averageDurationMinutes: 0 }

		const totalMinutes: number = reservations.reduce(
			(sum: number, r: Reservation): number => sum + this.getTotalMinutes(r.startTime, r.endTime),
			0,
		)

		return {
			averageDurationMinutes: Math.round((totalMinutes / reservations.length) * 100) / 100,
		}
	}

	private calculateRoomOccupancy(
		periodRange: PeriodRangeForOccupancy,
		room: Room,
		reservations: Reservation[],
	): RoomOccupancy {
		const reservedMinutes: number = reservations
			.filter((reservation: Reservation): boolean => reservation.roomId === room.id)
			.reduce((sum: number, reservation: Reservation): number => {
				const clippedStart: number = Math.max(reservation.startTime.getTime(), periodRange.start.getTime())
				const clippedEnd: number = Math.min(reservation.endTime.getTime(), periodRange.end.getTime())
				return sum + (clippedEnd - clippedStart) / 60000
			}, 0)

		return {
			roomName: room.name,
			occupancyRate: Math.round((reservedMinutes / periodRange.totalMinutes) * 10000) / 100,
		}
	}

	private getPeriodRange(period: OccupancyPeriod): PeriodRangeForOccupancy {
		const now: Date = new Date()

		switch (period) {
			case OccupancyPeriod.daily: {
				const start: Date = new Date(now)
				start.setHours(0, 0, 0, 0)
				const end: Date = new Date(now)
				end.setHours(23, 59, 59, 999)
				return { start, end, totalMinutes: this.getTotalMinutes(start, end) }
			}
			case OccupancyPeriod.weekly: {
				const start: Date = new Date(now)
				const day: number = start.getDay()
				start.setDate(start.getDate() - (day === 0 ? 6 : day - 1))
				start.setHours(0, 0, 0, 0)
				const end: Date = new Date(start)
				end.setDate(start.getDate() + 6)
				end.setHours(23, 59, 59, 999)
				return { start, end, totalMinutes: this.getTotalMinutes(start, end) }
			}
			case OccupancyPeriod.monthly: {
				const start: Date = new Date(now.getFullYear(), now.getMonth(), 1)
				const end: Date = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
				return { start, end, totalMinutes: this.getTotalMinutes(start, end) }
			}
		}
	}

	private getTotalMinutes(start: Date, end: Date): number {
		return (end.getTime() - start.getTime()) / 60000
	}
}
