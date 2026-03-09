import { Room } from '@/prisma/client'
import type { RoomReservationCount, TopRoom } from '@/types'

export class StatisticsMapper {
	static toTopRoom(grouped: RoomReservationCount, roomMap: Map<string, string>, rank: number): TopRoom {
		return {
			rank,
			roomName: roomMap.get(grouped.roomId) ?? '',
			reservationCount: grouped.reservationCount,
		}
	}

	static buildRoomMap(rooms: Room[]): Map<string, string> {
		return new Map(rooms.map((room: Room): [string, string] => [room.id, room.name]))
	}
}
