import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class UpdateReservationDto {
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	title?: string

	@IsOptional()
	@IsDateString()
	startTime?: string

	@IsOptional()
	@IsDateString()
	endTime?: string
}
