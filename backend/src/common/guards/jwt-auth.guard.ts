import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'
import type { JwtPayload } from '@/types'

@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(private readonly jwtService: JwtService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request: Request = context.switchToHttp().getRequest<Request>()
		const token: string | undefined = this.extractToken(request)

		if (!token) throw new UnauthorizedException()

		try {
			request.user = await this.jwtService.verifyAsync<JwtPayload>(token)
		} catch {
			throw new UnauthorizedException()
		}

		return true
	}

	private extractToken(request: Request): string | undefined {
		const [type, token]: string[] = request.headers.authorization?.split(' ') ?? []
		return type === 'Bearer' ? token : undefined
	}
}
