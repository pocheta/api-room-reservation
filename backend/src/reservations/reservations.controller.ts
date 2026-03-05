import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { JwtPayload, ReservationResponse } from '@/types'
import { ReservationsService } from './reservations.service'
import { CreateReservationDto } from './dto/create-reservation.dto'
import { UpdateReservationDto } from './dto/update-reservation.dto'

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
	constructor(private readonly reservationsService: ReservationsService) {}

	@Post()
	create(@CurrentUser() user: JwtPayload, @Body() dto: CreateReservationDto): Promise<ReservationResponse> {
		return this.reservationsService.create(user.sub, dto)
	}

	@Patch(':id')
	update(
		@CurrentUser() user: JwtPayload,
		@Param('id') id: string,
		@Body() dto: UpdateReservationDto,
	): Promise<ReservationResponse> {
		return this.reservationsService.update(user.sub, id, dto)
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	remove(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<void> {
		return this.reservationsService.remove(user.sub, id)
	}
}
