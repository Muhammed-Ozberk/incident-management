import { Injectable } from '@nestjs/common';
import {
  Incident as PrismaIncident,
  IncidentSeverity as PrismaIncidentSeverity,
  IncidentStatus as PrismaIncidentStatus,
  Prisma,
  Service as PrismaServiceModel,
} from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { Incident, IncidentStats, PaginatedIncidents } from '../domain/incident.types';
import { IncidentSeverity, IncidentStatus } from '../domain/incident.enums';
import { CreateIncidentDto } from '../presentation/dto/create-incident.dto';
import { QueryIncidentsDto } from '../presentation/dto/query-incidents.dto';
import { UpdateIncidentDto } from '../presentation/dto/update-incident.dto';

type FindManyParams = Required<Pick<QueryIncidentsDto, 'page' | 'limit'>> &
  Omit<QueryIncidentsDto, 'page' | 'limit'>;

type CreateIncidentInput = Omit<CreateIncidentDto, 'serviceId'> & {
  serviceId: string;
};

@Injectable()
export class IncidentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createIncidentDto: CreateIncidentInput): Promise<Incident> {
    const incident = await this.prisma.incident.create({
      data: {
        title: createIncidentDto.title,
        description: createIncidentDto.description,
        serviceId: createIncidentDto.serviceId,
        severity: createIncidentDto.severity as PrismaIncidentSeverity,
        logs: {
          create: {
            action: 'INITIAL_CREATION',
            newValue: JSON.stringify(createIncidentDto),
          },
        },
      },
      include: {
        service: true,
      },
    });

    return this.toDomain(incident);
  }

  async findMany(params: FindManyParams): Promise<PaginatedIncidents> {
    const where: Prisma.IncidentWhereInput = {
      deletedAt: null,
      status: params.status as PrismaIncidentStatus | undefined,
      severity: params.severity as PrismaIncidentSeverity | undefined,
      serviceId: params.serviceId,
      service: params.service
        ? {
            name: {
              contains: params.service,
              mode: 'insensitive',
            },
          }
        : undefined,
    };

    const skip = (params.page - 1) * params.limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.incident.findMany({
        where,
        orderBy: {
          createdAt: params.order ?? 'desc',
        },
        skip,
        take: params.limit,
        include: {
          service: true,
        },
      }),
      this.prisma.incident.count({ where }),
    ]);

    return {
      items: items.map((incident) => this.toDomain(incident)),
      meta: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async findById(id: string): Promise<Incident | null> {
    const incident = await this.prisma.incident.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        service: true,
        logs: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return incident ? this.toDomain(incident) : null;
  }

  async update(
    id: string,
    updateIncidentDto: UpdateIncidentDto,
  ): Promise<Incident> {
    const oldIncident = await this.prisma.incident.findUnique({
      where: { id, deletedAt: null },
      include: {
        service: true,
      },
    });

    if (!oldIncident) {
      throw new Error(`Incident with id ${id} not found`);
    }

    const auditLogs: Prisma.IncidentAuditLogCreateWithoutIncidentInput[] = [];

    if (
      updateIncidentDto.status !== undefined &&
      updateIncidentDto.status !== oldIncident.status
    ) {
      auditLogs.push({
        action: 'STATUS_CHANGED',
        oldValue: oldIncident.status,
        newValue: updateIncidentDto.status,
      });
    }

    const incident = await this.prisma.incident.update({
      where: {
        id,
      },
      data: {
        title: updateIncidentDto.title,
        description: updateIncidentDto.description,
        summary: updateIncidentDto.summary,
        severity: updateIncidentDto.severity as
          | PrismaIncidentSeverity
          | undefined,
        status: updateIncidentDto.status as PrismaIncidentStatus | undefined,
        serviceId: updateIncidentDto.serviceId,
        logs: {
          create: auditLogs,
        },
      },
      include: {
        service: true,
      },
    });

    return this.toDomain(incident);
  }

  async getStats(): Promise<IncidentStats> {
    const [total, open, critical, investigating] = await Promise.all([
      this.prisma.incident.count({ where: { deletedAt: null } }),
      this.prisma.incident.count({
        where: { status: PrismaIncidentStatus.open, deletedAt: null },
      }),
      this.prisma.incident.count({
        where: { severity: PrismaIncidentSeverity.critical, deletedAt: null },
      }),
      this.prisma.incident.count({
        where: { status: PrismaIncidentStatus.investigating, deletedAt: null },
      }),
    ]);

    return {
      total,
      open,
      critical,
      investigating,
    };
  }

  async remove(id: string): Promise<void> {
    await this.prisma.incident.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
        logs: {
          create: {
            action: 'SOFT_DELETED',
          },
        },
      },
    });
  }

  private toDomain(
    incident: PrismaIncident & { service: PrismaServiceModel; logs?: any[] },
  ): Incident {
    return {
      id: incident.id,
      title: incident.title,
      description: incident.description,
      summary: incident.summary ?? undefined,
      serviceId: incident.serviceId,
      service: {
        id: incident.service.id,
        name: incident.service.name,
      },
      severity: incident.severity as IncidentSeverity,
      status: incident.status as IncidentStatus,
      createdAt: incident.createdAt,
      updatedAt: incident.updatedAt,
      deletedAt: incident.deletedAt ?? undefined,
      logs: incident.logs?.map((log) => ({
        id: log.id,
        action: log.action,
        oldValue: log.oldValue,
        newValue: log.newValue,
        createdAt: log.createdAt,
      })),
    };
  }
}
