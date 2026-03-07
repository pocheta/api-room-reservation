import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateReservationDto {
	@ApiPropertyOptional({ example: 'Updated sync' })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	title?: string

	@ApiPropertyOptional({ example: '2026-03-10T10:00:00.000Z' })
	@IsOptional()
	@IsDateString()
	startTime?: string

	@ApiPropertyOptional({ example: '2026-03-10T11:00:00.000Z' })
	@IsOptional()
	@IsDateString()
	endTime?: string
}
