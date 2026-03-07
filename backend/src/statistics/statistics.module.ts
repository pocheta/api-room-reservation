import { Module } from '@nestjs/common'
import { ReservationsModule } from '@/reservations/reservations.module'
import { RoomsModule } from '@/rooms/rooms.module'
import { StatisticsController } from './statistics.controller'
import { StatisticsService } from './statistics.service'

@Module({
	imports: [RoomsModule, ReservationsModule],
	controllers: [StatisticsController],
	providers: [StatisticsService],
})
export class StatisticsModule {}
