import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StocksModule } from './modules/stocks/stocks.module';
import { HealthController } from './modules/health/health.controller';

@Module({
  imports: [ConfigModule, PrismaModule, AuthModule, UsersModule, StocksModule],
  controllers: [HealthController],
})
export class AppModule {}
