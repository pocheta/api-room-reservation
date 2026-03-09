import { IsDateString, IsNotEmpty, IsString, IsUUID, ValidateIf } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateReservationDto {
	@ApiProperty({ example: 'Weekly sync' })
	@IsString()
	@IsNotEmpty()
	title: string

	@ApiProperty({ example: '2026-03-10T09:00:00.000Z' })
	@IsDateString()
	startTime: string

	@ApiProperty({ example: '2026-03-10T10:00:00.000Z' })
	@IsDateString()
	endTime: string

	@ApiProperty({
		example: 'c82f5bc5-cd41-4273-b0aa-cdf93e2042b6',
		required: false,
		description: 'Required if roomName is not provided',
	})
	@ValidateIf((o: CreateReservationDto) => !o.roomName)
	@IsUUID()
	roomId?: string

	@ApiProperty({ example: 'Salle VN-5', required: false, description: 'Required if roomId is not provided' })
	@ValidateIf((o: CreateReservationDto) => !o.roomId)
	@IsString()
	@IsNotEmpty()
	roomName?: string
}
