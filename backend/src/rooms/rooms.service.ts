import { Injectable } from '@nestjs/common'
import { RoomSummary } from '@/types'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class RoomsService {
	constructor(private readonly prisma: PrismaService) {}

	findAll(): Promise<RoomSummary[]> {
		return this.prisma.room.findMany({
			select: { name: true, capacity: true, description: true },
			orderBy: { name: 'asc' },
		})
	}
}
