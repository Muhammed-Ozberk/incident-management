import { Test, TestingModule } from '@nestjs/testing';
import { IncidentsService } from './incidents.service';
import { IncidentsRepository } from '../infrastructure/incidents.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { IncidentSeverity, IncidentStatus } from '../domain/incident.enums';
import {
  INCIDENT_CREATED_EVENT,
  INCIDENT_DELETED_EVENT,
  INCIDENT_UPDATED_EVENT,
} from '../domain/incident.events';
import { AiService } from '../../ai/ai.service';
import { ServicesRepository } from '../../services/infrastructure/services.repository';

describe('IncidentsService', () => {
  let service: IncidentsService;
  let repository: jest.Mocked<IncidentsRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let servicesRepository: jest.Mocked<ServicesRepository>;

  const mockIncident = {
    id: 'test-id',
    title: 'Test Incident',
    description: 'Test Description',
    serviceId: 'service-id',
    service: {
      id: 'service-id',
      name: 'Test Service',
    },
    severity: IncidentSeverity.HIGH,
    status: IncidentStatus.OPEN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findMany: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      getStats: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };
    const mockAiService = {
      suggestIncidentDetails: jest.fn(),
    };
    const mockServicesRepository = {
      findActiveById: jest.fn().mockResolvedValue({
        id: 'service-id',
        name: 'Test Service',
        description: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncidentsService,
        { provide: IncidentsRepository, useValue: mockRepository },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: AiService, useValue: mockAiService },
        { provide: ServicesRepository, useValue: mockServicesRepository },
      ],
    }).compile();

    service = module.get<IncidentsService>(IncidentsService);
    repository = module.get(IncidentsRepository);
    eventEmitter = module.get(EventEmitter2);
    servicesRepository = module.get(ServicesRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an incident and emit an event', async () => {
      const dto = {
        title: 'New Incident',
        description: 'Desc',
        serviceId: 'service-id',
        severity: IncidentSeverity.CRITICAL,
      };
      repository.create.mockResolvedValue(mockIncident);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(servicesRepository.findActiveById).toHaveBeenCalledWith('service-id');
      expect(eventEmitter.emit).toHaveBeenCalledWith(INCIDENT_CREATED_EVENT, mockIncident);
      expect(result).toEqual(mockIncident);
    });
  });

  describe('findById', () => {
    it('should return an incident if found', async () => {
      repository.findById.mockResolvedValue(mockIncident);

      const result = await service.findById('test-id');

      expect(result).toEqual(mockIncident);
    });

    it('should throw NotFoundException if not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and emit an event', async () => {
      const dto = { status: IncidentStatus.RESOLVED };
      repository.findById.mockResolvedValue(mockIncident);
      repository.update.mockResolvedValue({ ...mockIncident, ...dto });

      const result = await service.update('test-id', dto);

      expect(eventEmitter.emit).toHaveBeenCalledWith(INCIDENT_UPDATED_EVENT, expect.any(Object));
      expect(result.status).toBe(IncidentStatus.RESOLVED);
    });

    it('should throw BadRequestException if dto is empty', async () => {
      await expect(service.update('test-id', {})).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove an incident and emit a delete event', async () => {
      repository.findById.mockResolvedValue(mockIncident);
      
      await service.remove('test-id');

      expect(repository.remove).toHaveBeenCalledWith('test-id');
      expect(eventEmitter.emit).toHaveBeenCalledWith(INCIDENT_DELETED_EVENT, { id: 'test-id' });
    });
  });
});
