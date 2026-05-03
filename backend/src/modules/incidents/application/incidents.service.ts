import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  INCIDENT_CREATED_EVENT,
  INCIDENT_DELETED_EVENT,
  INCIDENT_UPDATED_EVENT,
} from '../domain/incident.events';
import { Incident } from '../domain/incident.types';
import { IncidentsRepository } from '../infrastructure/incidents.repository';
import { CreateIncidentDto } from '../presentation/dto/create-incident.dto';
import { QueryIncidentsDto } from '../presentation/dto/query-incidents.dto';
import { UpdateIncidentDto } from '../presentation/dto/update-incident.dto';
import { AiService } from '../../ai/ai.service';
import { ServicesRepository } from '../../services/infrastructure/services.repository';

@Injectable()
export class IncidentsService {
  constructor(
    private readonly incidentsRepository: IncidentsRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly aiService: AiService,
    private readonly servicesRepository: ServicesRepository,
  ) {}

  async create(createIncidentDto: CreateIncidentDto) {
    const serviceId = await this.resolveCreateServiceId(createIncidentDto);
    const incident = await this.incidentsRepository.create({
      ...createIncidentDto,
      serviceId,
    });
    this.eventEmitter.emit(INCIDENT_CREATED_EVENT, incident);
    return incident;
  }

  findMany(query: QueryIncidentsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    return this.incidentsRepository.findMany({
      page,
      limit,
      status: query.status,
      severity: query.severity,
      service: query.service,
      serviceId: query.serviceId,
      order: query.order,
    });
  }

  getStats() {
    return this.incidentsRepository.getStats();
  }

  async findById(id: string) {
    const incident = await this.incidentsRepository.findById(id);

    if (!incident) {
      throw new NotFoundException(`Incident with id "${id}" was not found`);
    }

    return incident;
  }

  async update(id: string, updateIncidentDto: UpdateIncidentDto) {
    if (Object.keys(updateIncidentDto).length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }

    await this.ensureIncidentExists(id);
    if (updateIncidentDto.serviceId) {
      await this.ensureServiceIsActive(updateIncidentDto.serviceId);
    }

    const incident = await this.incidentsRepository.update(id, updateIncidentDto);
    this.eventEmitter.emit(INCIDENT_UPDATED_EVENT, incident);
    return incident;
  }

  async remove(id: string) {
    await this.ensureIncidentExists(id);
    await this.incidentsRepository.remove(id);

    const payload = { id };
    this.eventEmitter.emit(INCIDENT_DELETED_EVENT, payload);
    return payload;
  }

  async suggest(title: string, description: string) {
    const services = await this.servicesRepository.findMany(false);
    return this.aiService.suggestIncidentDetails(title, description, services);
  }

  async summarize(id: string, regenerate: boolean) {
    const incident = await this.findById(id);

    if (incident.summary && !regenerate) {
      return {
        summary: incident.summary,
        generated: false,
      };
    }

    const { summary } = await this.aiService.summarizeIncident(
      incident.title,
      incident.description,
    );
    const updatedIncident = await this.incidentsRepository.update(id, { summary });
    this.eventEmitter.emit(INCIDENT_UPDATED_EVENT, updatedIncident);

    return {
      summary: updatedIncident.summary ?? summary,
      generated: true,
    };
  }

  private async ensureIncidentExists(id: string): Promise<Incident> {
    const incident = await this.incidentsRepository.findById(id);

    if (!incident) {
      throw new NotFoundException(`Incident with id "${id}" was not found`);
    }

    return incident;
  }

  private async ensureServiceIsActive(serviceId: string) {
    const service = await this.servicesRepository.findActiveById(serviceId);

    if (!service) {
      throw new BadRequestException(`Active service with id "${serviceId}" was not found`);
    }

    return service;
  }

  private async resolveCreateServiceId(createIncidentDto: CreateIncidentDto) {
    if (createIncidentDto.serviceId) {
      const service = await this.ensureServiceIsActive(createIncidentDto.serviceId);
      return service.id;
    }

    if (createIncidentDto.service) {
      const service = await this.servicesRepository.findActiveByName(
        createIncidentDto.service,
      );

      if (!service) {
        throw new BadRequestException(
          `Active service with name "${createIncidentDto.service}" was not found`,
        );
      }

      return service.id;
    }

    throw new BadRequestException('serviceId or service must be provided');
  }
}
