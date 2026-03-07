import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { AverageDurationStats, OccupancyStats, TopRoom } from '@/types'
import { StatisticsService } from './statistics.service'
import { OccupancyQueryDto } from './dto/occupancy-query.dto'
import { TopRoomsQueryDto } from './dto/top-rooms-query.dto'

@ApiTags('statistics')
@ApiBearerAuth()
@Controller('statistics')
@UseGuards(JwtAuthGuard)
export class StatisticsController {
	constructor(private readonly statisticsService: StatisticsService) {}

	@Get('occupancy')
	@ApiOperation({ summary: 'Get occupancy rate per room for a given period' })
	@ApiResponse({ status: 200, description: 'Returns occupancy rate (%) per room for the requested period' })
	@ApiResponse({ status: 400, description: 'Invalid period value' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	getOccupancy(@Query() query: OccupancyQueryDto): Promise<OccupancyStats> {
		return this.statisticsService.getOccupancy(query.period)
	}

	@Get('top-rooms')
	@ApiOperation({ summary: 'Get top N most reserved rooms' })
	@ApiResponse({ status: 200, description: 'Returns rooms ranked by confirmed reservation count' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	getTopRooms(@Query() query: TopRoomsQueryDto): Promise<TopRoom[]> {
		return this.statisticsService.getTopRooms(query.limit)
	}

	@Get('average-duration')
	@ApiOperation({ summary: 'Get average duration of confirmed reservations' })
	@ApiResponse({ status: 200, description: 'Returns average duration in minutes' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	getAverageDuration(): Promise<AverageDurationStats> {
		return this.statisticsService.getAverageDuration()
	}
}
