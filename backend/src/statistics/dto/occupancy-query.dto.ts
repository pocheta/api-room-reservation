import { IsEnum } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { OccupancyPeriod } from '@/types'

export class OccupancyQueryDto {
	@ApiProperty({ enum: OccupancyPeriod, example: OccupancyPeriod.weekly })
	@IsEnum(OccupancyPeriod)
	period: OccupancyPeriod
}
