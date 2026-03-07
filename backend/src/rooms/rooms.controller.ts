import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RoomSummary } from '@/types'
import { RoomsService } from './rooms.service'
import { RoomMapper } from '@/rooms/room.mapper'

@ApiTags('rooms')
@ApiBearerAuth()
@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
	constructor(private readonly roomsService: RoomsService) {}

	@Get()
	@ApiOperation({ summary: 'List all rooms' })
	@ApiResponse({ status: 200, description: 'Returns the list of all rooms' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	async findAll(): Promise<RoomSummary[]> {
		return (await this.roomsService.findAll()).map(RoomMapper.toSummary)
	}
}
