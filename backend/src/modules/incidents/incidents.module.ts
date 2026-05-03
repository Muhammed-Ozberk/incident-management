import { Module } from '@nestjs/common';
import { IncidentsService } from './application/incidents.service';
import { IncidentsRepository } from './infrastructure/incidents.repository';
import { IncidentsController } from './presentation/incidents.controller';
import { AiModule } from '../ai/ai.module';
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [AiModule, ServicesModule],
  controllers: [IncidentsController],
  providers: [IncidentsService, IncidentsRepository],
})
export class IncidentsModule {}
