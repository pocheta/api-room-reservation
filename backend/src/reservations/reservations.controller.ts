import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import type { JwtPayload, ReservationResponse } from '@/types'
import { ReservationsService } from './reservations.service'
import { CreateReservationDto } from './dto/create-reservation.dto'
import { UpdateReservationDto } from './dto/update-reservation.dto'

@ApiTags('reservations')
@ApiBearerAuth()
@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
	constructor(private readonly reservationsService: ReservationsService) {}

	@Post()
	@ApiOperation({ summary: 'Create a reservation' })
	@ApiResponse({ status: 201, description: 'Reservation created' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 404, description: 'Room not found' })
	@ApiResponse({ status: 422, description: 'Invalid time range or room unavailable' })
	create(@CurrentUser() user: JwtPayload, @Body() dto: CreateReservationDto): Promise<ReservationResponse> {
		return this.reservationsService.create(user.sub, dto)
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update a reservation' })
	@ApiResponse({ status: 200, description: 'Reservation updated' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden — not the owner' })
	@ApiResponse({ status: 404, description: 'Reservation not found' })
	@ApiResponse({ status: 422, description: 'Invalid time range, room unavailable or reservation already cancelled' })
	update(
		@CurrentUser() user: JwtPayload,
		@Param('id') id: string,
		@Body() dto: UpdateReservationDto,
	): Promise<ReservationResponse> {
		return this.reservationsService.update(user.sub, id, dto)
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Cancel a reservation' })
	@ApiResponse({ status: 204, description: 'Reservation cancelled' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden — not the owner' })
	@ApiResponse({ status: 404, description: 'Reservation not found' })
	@ApiResponse({ status: 422, description: 'Reservation already cancelled or already ended' })
	remove(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<void> {
		return this.reservationsService.remove(user.sub, id)
	}
}
