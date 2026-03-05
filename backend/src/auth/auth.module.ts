import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { jwtConfig } from '@/config/jwt.config'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { UsersModule } from '@/users/users.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
	imports: [JwtModule.registerAsync(jwtConfig), UsersModule],
	controllers: [AuthController],
	providers: [AuthService, JwtAuthGuard],
	exports: [JwtAuthGuard],
})
export class AuthModule {}
