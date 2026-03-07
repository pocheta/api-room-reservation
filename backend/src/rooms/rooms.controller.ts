import { Controller, Get, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RoomSummary } from '@/types'
import { RoomsService } from './rooms.service'
import { RoomMapper } from '@/rooms/room.mapper'

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
	constructor(private readonly roomsService: RoomsService) {}

	@Get()
	async findAll(): Promise<RoomSummary[]> {
		return (await this.roomsService.findAll()).map(RoomMapper.toSummary)
	}
}
