import { Controller, Get, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RoomSummary } from '@/types'
import { RoomsService } from './rooms.service'

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
	constructor(private readonly roomsService: RoomsService) {}

	@Get()
	findAll(): Promise<RoomSummary[]> {
		return this.roomsService.findAll()
	}
}
