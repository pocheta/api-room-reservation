import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare, hash } from 'bcryptjs'
import { AuthResponse, JwtPayload } from '@/types'
import { PrismaService } from '../prisma/prisma.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

type TokenUser = { id: string; email: string }

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService,
	) {}

	async register(dto: RegisterDto): Promise<AuthResponse> {
		const existing: { id: string } | null = await this.prisma.user.findUnique({ where: { email: dto.email }, select: { id: true } })

		if (existing) throw new ConflictException('Email already in use')

		const password: string = await hash(dto.password, 10)
		const user: TokenUser = await this.prisma.user.create({
			data: { ...dto, password },
			select: { id: true, email: true },
		})

		return this.generateToken(user)
	}

	async login(dto: LoginDto): Promise<AuthResponse> {
		const user: TokenUser & { password: string } | null = await this.prisma.user.findUnique({
			where: { email: dto.email },
			select: { id: true, email: true, password: true },
		})

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
