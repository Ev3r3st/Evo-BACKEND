import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Pro konfiguraci prostředí
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 4001,
      username: 'evo_admin', // Změň podle svého
      password: 'evo_admin', // Změň podle svého
      database: 'evo_database', // Změň podle svého
      autoLoadEntities: true, // Jen pro vývoj, v produkci deaktivovat!
      entities: ['dist/**/*.entity{.ts,.js}'],
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
