import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { ReservationsModule } from './reservations/reservations.module'
import { RoomsModule } from './rooms/rooms.module'
import { StatisticsModule } from './statistics/statistics.module'
import { UsersModule } from './users/users.module'

@Module({
	imports: [PrismaModule, AuthModule, UsersModule, RoomsModule, ReservationsModule, StatisticsModule],
})
export class AppModule {}
