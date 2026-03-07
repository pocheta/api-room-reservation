import { Room } from '@/prisma/client'
import { RoomSummary } from '@/types'

export class RoomMapper {
	static toSummary(room: Room): RoomSummary {
		return {
			name: room.name,
			capacity: room.capacity,
			description: room.description,
		}
	}
}
