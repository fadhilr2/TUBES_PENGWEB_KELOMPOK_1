import { MediaController } from './media/media.controller';
import { PaymentsController } from './payments/payments.controller';
import { PaymentsService } from './payments/payments.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AccessGuard } from './auth/access';
import { AuthController } from './auth/auth.controller';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { ServicesController } from './services/services.controller';
import { ServicesService } from './services/services.service';
import { ReviewsController } from './reviews/reviews.controller';
import { OrdersController } from './orders/orders.controller';
import { OrdersService } from './orders/orders.service';
import { DashboardController } from './dashboard/dashboard.controller';
import { AdminController } from './admin/admin.controller';
import { HealthController } from './health/health.controller';
import { DatabaseService } from './database/database.service';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET })],
  controllers: [
    AuthController,
    UsersController,
    ServicesController,
    ReviewsController,
    OrdersController,
    DashboardController,
    AdminController,
    HealthController,
    MediaController,
    PaymentsController,
  ],
  providers: [
    DatabaseService,
    UsersService,
    ServicesService,
    OrdersService,
    PaymentsService,
    { provide: APP_GUARD, useClass: AccessGuard },
  ],
})
export class AppModule {}
