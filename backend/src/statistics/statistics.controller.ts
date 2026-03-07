import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { AverageDurationStats, OccupancyStats, TopRoom } from '@/types'
import { StatisticsService } from './statistics.service'
import { OccupancyQueryDto } from './dto/occupancy-query.dto'
import { TopRoomsQueryDto } from './dto/top-rooms-query.dto'

@Controller('statistics')
@UseGuards(JwtAuthGuard)
export class StatisticsController {
	constructor(private readonly statisticsService: StatisticsService) {}

	@Get('occupancy')
	getOccupancy(@Query() query: OccupancyQueryDto): Promise<OccupancyStats> {
		return this.statisticsService.getOccupancy(query.period)
	}

	@Get('top-rooms')
	getTopRooms(@Query() query: TopRoomsQueryDto): Promise<TopRoom[]> {
		return this.statisticsService.getTopRooms(query.limit)
	}

	@Get('average-duration')
	getAverageDuration(): Promise<AverageDurationStats> {
		return this.statisticsService.getAverageDuration()
	}
}
