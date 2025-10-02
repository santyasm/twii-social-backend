import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  app.enableCors({
    origin: frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Twii Social API')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const theme = new SwaggerTheme();
  const darkThemeCss = theme.getBuffer(SwaggerThemeNameEnum.DARK);

  const customOptions: SwaggerCustomOptions = {
    customCss: darkThemeCss.toString(),
    customSiteTitle: 'Twii Social API (Dark Mode)',
    swaggerOptions: {
      docExpansion: 'list',
      apisSorter: 'alpha',
      persistAuthorization: true,
    },
  };

  SwaggerModule.setup('docs', app, document, customOptions);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
