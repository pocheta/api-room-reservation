import { Injectable } from '@nestjs/common'
import { CreateUserData, TokenUser, UserCredentials, UserSummary } from '@/types'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}

	findAll(): Promise<UserSummary[]> {
		return this.prisma.user.findMany({
			select: { firstname: true, lastname: true, email: true },
			orderBy: { lastname: 'asc' },
		})
	}

	findByEmail(email: string): Promise<UserCredentials | null> {
		return this.prisma.user.findUnique({
			where: { email },
			select: { id: true, email: true, password: true },
		})
	}

	create(data: CreateUserData): Promise<TokenUser> {
		return this.prisma.user.create({
			data,
			select: { id: true, email: true },
		})
	}
}
