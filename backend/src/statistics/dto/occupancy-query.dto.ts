import { IsEnum } from 'class-validator'
import { OccupancyPeriod } from '@/types'

export class OccupancyQueryDto {
	@IsEnum(OccupancyPeriod)
	period: OccupancyPeriod
}
