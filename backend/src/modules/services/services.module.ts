import { Module } from '@nestjs/common';
import { ServicesService } from './application/services.service';
import { ServicesRepository } from './infrastructure/services.repository';
import { ServicesController } from './presentation/services.controller';

@Module({
  controllers: [ServicesController],
  providers: [ServicesService, ServicesRepository],
  exports: [ServicesRepository],
})
export class ServicesModule {}
