import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare, hash } from 'bcryptjs'
import type { AuthResponse, JwtPayload, TokenUser, UserCredentials } from '@/types'
import { UsersService } from '@/users/users.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
	) {}

	async register(dto: RegisterDto): Promise<AuthResponse> {
		const existing: UserCredentials | null = await this.usersService.findByEmail(dto.email)

		if (existing) throw new ConflictException('Email already in use')

		const password: string = await hash(dto.password, 10)
		const user: TokenUser = await this.usersService.create({ ...dto, password })

		return this.generateToken(user)
	}

	async login(dto: LoginDto): Promise<AuthResponse> {
		const user: UserCredentials | null = await this.usersService.findByEmail(dto.email)

		if (!user || !(await compare(dto.password, user.password))) {
			throw new UnauthorizedException('Invalid credentials')
		}

		return this.generateToken(user)
	}

	private generateToken(user: TokenUser): AuthResponse {
		const payload: JwtPayload = { sub: user.id, email: user.email }
		return { access_token: this.jwtService.sign(payload) }
	}
}
