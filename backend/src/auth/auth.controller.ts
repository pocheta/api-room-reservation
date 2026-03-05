import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { AuthResponse } from '@/types'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	register(@Body() dto: RegisterDto): Promise<AuthResponse> {
		return this.authService.register(dto)
	}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	login(@Body() dto: LoginDto): Promise<AuthResponse> {
		return this.authService.login(dto)
	}
}
