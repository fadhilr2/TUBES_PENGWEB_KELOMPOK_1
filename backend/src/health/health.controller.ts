import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { Public } from '../auth/access';
import { DatabaseService } from '../database/database.service';

@Controller('health')
export class HealthController {
  constructor(private readonly database: DatabaseService) {}
  @Public() @Get() async health() {
    try {
      await this.database.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'ready' };
    } catch {
      throw new ServiceUnavailableException('Database belum tersedia.');
    }
  }
}
