import { NestFactory } from '@nestjs/core'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'

function assertEnv(key: string): void {
	const value: string | undefined = process.env[key]
	if (!value) throw new Error(`Missing required environment variable: ${key}`)
}

function setupSwagger(app: INestApplication): void {
	const config: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
		.setTitle('Room Reservation API')
		.setDescription('REST API for managing room reservations')
		.setVersion('1.0')
		.addServer('/api')
		.addBearerAuth()
		.build()

	const document: OpenAPIObject = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup('docs', app, document)
}

async function bootstrap(): Promise<void> {
	assertEnv('JWT_SECRET')
	assertEnv('DATABASE_URL')

	const app: INestApplication = await NestFactory.create(AppModule)

	app.useGlobalFilters(new AllExceptionsFilter())
	app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

	setupSwagger(app)

	await app.listen(process.env['PORT'] ?? 3000)
}

void bootstrap()
