import { NestFactory } from '@nestjs/core'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'

function assertEnv(key: string): string {
	const value: string | undefined = process.env[key]
	if (!value) throw new Error(`Missing required environment variable: ${key}`)
	return value
}

async function bootstrap(): Promise<void> {
	assertEnv('JWT_SECRET')
	assertEnv('DATABASE_URL')

	const app: INestApplication = await NestFactory.create(AppModule)

	app.useGlobalFilters(new AllExceptionsFilter())
	app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

	await app.listen(process.env['PORT'] ?? 3000)
}

void bootstrap()
