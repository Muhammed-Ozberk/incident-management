import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Service } from '../domain/service.types';
import { ServicesRepository } from '../infrastructure/services.repository';
import { CreateServiceDto } from '../presentation/dto/create-service.dto';
import { UpdateServiceDto } from '../presentation/dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly servicesRepository: ServicesRepository) {}

  findMany(includeInactive = false): Promise<Service[]> {
    return this.servicesRepository.findMany(includeInactive);
  }

  async findById(id: string): Promise<Service> {
    const service = await this.servicesRepository.findById(id);

    if (!service) {
      throw new NotFoundException(`Service with id "${id}" was not found`);
    }

    return service;
  }

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    try {
      return await this.servicesRepository.create(createServiceDto);
    } catch (error) {
      if (this.servicesRepository.isUniqueNameError(error)) {
        throw new ConflictException('Service name already exists');
      }

      throw error;
    }
  }

  async update(id: string, updateServiceDto: UpdateServiceDto): Promise<Service> {
    if (Object.keys(updateServiceDto).length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }

    await this.findById(id);

    try {
      return await this.servicesRepository.update(id, updateServiceDto);
    } catch (error) {
      if (this.servicesRepository.isUniqueNameError(error)) {
        throw new ConflictException('Service name already exists');
      }

      throw error;
    }
  }

  async deactivate(id: string): Promise<Service> {
    await this.findById(id);
    return this.servicesRepository.deactivate(id);
  }
}
