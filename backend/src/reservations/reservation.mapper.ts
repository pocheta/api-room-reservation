import { Reservation } from '@/prisma/client'
import type { ReservationResponse } from '@/types'

export class ReservationMapper {
	static toResponse(reservation: Reservation): ReservationResponse {
		return {
			id: reservation.id,
			title: reservation.title,
			startTime: reservation.startTime,
			endTime: reservation.endTime,
			status: reservation.status,
			roomId: reservation.roomId,
			userId: reservation.userId,
		}
	}
}
