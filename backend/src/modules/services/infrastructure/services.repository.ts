import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { Service } from '../domain/service.types';
import { CreateServiceDto } from '../presentation/dto/create-service.dto';
import { UpdateServiceDto } from '../presentation/dto/update-service.dto';

@Injectable()
export class ServicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const service = await this.prisma.service.create({
      data: {
        name: createServiceDto.name.trim(),
        description: createServiceDto.description?.trim(),
      },
    });

    return this.toDomain(service);
  }

  async findMany(includeInactive = false): Promise<Service[]> {
    const services = await this.prisma.service.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: {
        name: 'asc',
      },
    });

    return services.map((service) => this.toDomain(service));
  }

  async findById(id: string): Promise<Service | null> {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    return service ? this.toDomain(service) : null;
  }

  async findActiveById(id: string): Promise<Service | null> {
    const service = await this.prisma.service.findFirst({
      where: {
        id,
        isActive: true,
      },
    });

    return service ? this.toDomain(service) : null;
  }

  async findActiveByName(name: string): Promise<Service | null> {
    const service = await this.prisma.service.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
        isActive: true,
      },
    });

    return service ? this.toDomain(service) : null;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto): Promise<Service> {
    const service = await this.prisma.service.update({
      where: { id },
      data: {
        name: updateServiceDto.name?.trim(),
        description: updateServiceDto.description?.trim(),
        isActive: updateServiceDto.isActive,
      },
    });

    return this.toDomain(service);
  }

  async deactivate(id: string): Promise<Service> {
    const service = await this.prisma.service.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    return this.toDomain(service);
  }

  isUniqueNameError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }

  private toDomain(service: {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Service {
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      isActive: service.isActive,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }
}
