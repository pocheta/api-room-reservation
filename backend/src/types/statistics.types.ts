export enum OccupancyPeriod {
	daily = 'daily',
	weekly = 'weekly',
	monthly = 'monthly',
}

export type RoomOccupancy = {
	roomName: string
	occupancyRate: number
}

export type OccupancyStats = {
	period: OccupancyPeriod
	from: Date
	to: Date
	rooms: RoomOccupancy[]
}

export type TopRoom = {
	rank: number
	roomName: string
	reservationCount: number
}

export type AverageDurationStats = {
	averageDurationMinutes: number
}

export type RoomReservationCount = {
	roomId: string
	reservationCount: number
}
