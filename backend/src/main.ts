import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //prefijo para todas las rutas de la API
  app.setGlobalPrefix('api');
  //para la validacion de los dto
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,             
    forbidNonWhitelisted: true,  
    transform: true,             
  }));
  app.enableCors({
    origin: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  });
  const port = process.env.BACKEND_PORT || 4000;
  await app.listen(port);
  console.log(`Backend corriendo en: http://localhost:${port}/api`);
}
bootstrap();
