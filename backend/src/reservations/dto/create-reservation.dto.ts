import { IsDateString, IsNotEmpty, IsString, IsUUID, ValidateIf } from 'class-validator'

export class CreateReservationDto {
	@IsString()
	@IsNotEmpty()
	title: string

	@IsDateString()
	startTime: string

	@IsDateString()
	endTime: string

	@ValidateIf((o: CreateReservationDto) => !o.roomName)
	@IsUUID()
	roomId?: string

	@ValidateIf((o: CreateReservationDto) => !o.roomId)
	@IsString()
	@IsNotEmpty()
	roomName?: string
}
