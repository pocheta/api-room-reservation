import { JwtModuleAsyncOptions, JwtModuleOptions } from '@nestjs/jwt'

export const jwtConfig: JwtModuleAsyncOptions = {
	global: true,
	useFactory: (): JwtModuleOptions => ({
		secret: process.env['JWT_SECRET'],
		signOptions: { expiresIn: '7d' },
	}),
}
