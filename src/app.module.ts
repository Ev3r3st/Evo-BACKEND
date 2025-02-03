import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { GoalModule } from './goal/goal.module';

@Module({
  imports: [
    // Load .env variables globally (e.g., DB credentials)
    ConfigModule.forRoot({ isGlobal: true }),

    // Database connection settings
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 4001,
      username: process.env.DB_USERNAME || 'evo_admin',
      password: process.env.DB_PASSWORD || 'evo_admin',
      database: process.env.DB_NAME || 'evo_database',

      // Use either autoLoadEntities or an explicit list of entities
      autoLoadEntities: true,

      // Enable synchronization for development (DEV) to auto-create/update tables
      synchronize: process.env.TYPEORM_SYNC === 'true',
      // For production, use migrations instead of synchronize
      // synchronize: false
    }),

    // Other modules
    UserModule,
    AuthModule,
    GoalModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
