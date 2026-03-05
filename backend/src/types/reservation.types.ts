import { ReservationStatus } from '@/prisma/client'

export type ReservationResponse = {
	id: string
	title: string
	startTime: Date
	endTime: Date
	status: ReservationStatus
	roomId: string
	userId: string
}
