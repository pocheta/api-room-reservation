import { NestFactory } from '@nestjs/core'
import { INestApplication } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap(): Promise<void> {
	const app: INestApplication = await NestFactory.create(AppModule)
	await app.listen(process.env.PORT ?? 3000)
}

void bootstrap()
