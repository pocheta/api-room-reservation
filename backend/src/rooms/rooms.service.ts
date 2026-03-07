import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Room } from '@/prisma/client'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class RoomsService {
	constructor(private readonly prisma: PrismaService) {}

	findAll(): Promise<Room[]> {
		return this.prisma.room.findMany({
			orderBy: { name: 'asc' },
		})
	}

	findRoomsByIds(ids: string[]): Promise<Room[]> {
		return this.prisma.room.findMany({ where: { id: { in: ids } } })
	}

	async resolveId(roomId?: string, roomName?: string): Promise<string> {
		if (roomId) return roomId

		if (roomName) {
			const room: { id: string } | null = await this.prisma.room.findUnique({
				where: { name: roomName },
				select: { id: true },
			})

			if (!room) throw new NotFoundException(`Room "${roomName}" not found`)
			return room.id
		}

		throw new BadRequestException('Either roomId or roomName must be provided')
	}
}
