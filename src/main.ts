import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Povolení CORS pro přístup z frontendu
  app.enableCors({
    origin: 'http://localhost:3000', // URL vašeho frontendu
    credentials: true, // Povolení cookies
  });

  // Nastavení globální validace
  app.useGlobalPipes(new ValidationPipe());

  // Nastavení globálního prefixu pro API
  app.setGlobalPrefix('api');

  // Konfigurace Swaggeru
  const config = new DocumentBuilder()
    .setTitle('API for Evo aplikace pro osobní rozvoj a dosažení cílů')
    .setDescription('API for user registration and login')
    .setVersion('1.0')
    .addBearerAuth() // Přidání možnosti JWT autentizace
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Spuštění aplikace na specifikovaném portu
  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  console.log(`Aplikace běží na http://localhost:${port}`);
}
bootstrap();
