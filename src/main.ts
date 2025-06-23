import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory, Reflector } from '@nestjs/core'
import * as cookieParser from 'cookie-parser'
import helmet from 'helmet'
import * as morgan from 'morgan'
import { AppModule } from './app.module'
import { TransformInterceptor } from './common/Interceptors/response.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)
  const reflector = app.get(Reflector)
  const corsOrigins = configService.get<string>('CORS_ORIGIN', '')
  const allowedOrigins = corsOrigins ? corsOrigins.split(',') : '*'

  app.setGlobalPrefix('api')
  app.use(helmet())
  app.use(morgan('dev'))
  app.use(cookieParser())
  app.useGlobalInterceptors(new TransformInterceptor(reflector))
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))

  app.enableCors({
    origin: allowedOrigins.length > 1 ? allowedOrigins : allowedOrigins[0],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })

  await app.listen(configService.get<string>('PORT', '1001'))

  console.log(
    `    - Listen BACKEND:
    - PORT: ${configService.get<string>('PORT', '1001')} 
    - CONNECTDB: ${configService.get<string>('MONGODB_URI', 'localhost:27017').slice(0, 90)} 
    - ENV: ${configService.get<string>('NODE_ENV', 'dev')}`,
  )
}
bootstrap()