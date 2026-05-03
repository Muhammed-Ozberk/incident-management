import {
  IncidentSeverity,
  IncidentStatus,
  PrismaClient,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const services = [
    {
      name: 'Payment API',
      description: 'Handles payment authorization and checkout flows.',
    },
    {
      name: 'Auth Service',
      description: 'Handles authentication, tokens, and user sessions.',
    },
    {
      name: 'Notification Worker',
      description: 'Processes email, push, and background notifications.',
    },
    {
      name: 'Search Service',
      description: 'Indexes and searches customer-facing records.',
    },
    {
      name: 'Database',
      description: 'Primary relational data store.',
    },
    {
      name: 'Event Pipeline',
      description: 'Processes asynchronous events and queues.',
    },
    {
      name: 'Cache Service',
      description: 'Stores hot data and shared cache entries.',
    },
    {
      name: 'API Gateway',
      description: 'Routes public API traffic to backend services.',
    },
    {
      name: 'General',
      description: 'Fallback service for uncategorized incidents.',
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: {
        name: service.name,
      },
      create: service,
      update: {
        description: service.description,
        isActive: true,
      },
    });
  }

  const incidents = [
    {
      title: 'Database timeout on payment service',
      description:
        'Users are receiving timeout errors during checkout operations.',
      service: 'Payment API',
      severity: IncidentSeverity.high,
      status: IncidentStatus.open,
    },
    {
      title: 'Token validation latency increased',
      description:
        'Authentication requests are slower than expected for a subset of users.',
      service: 'Auth Service',
      severity: IncidentSeverity.medium,
      status: IncidentStatus.investigating,
    },
    {
      title: 'Email delivery queue backlog',
      description:
        'Notification worker queue size is growing because email provider responses are delayed.',
      service: 'Notification Worker',
      severity: IncidentSeverity.low,
      status: IncidentStatus.open,
    },
    {
      title: 'Payment webhook failures',
      description:
        'Webhook acknowledgements are intermittently failing and retry volume is increasing.',
      service: 'Payment API',
      severity: IncidentSeverity.critical,
      status: IncidentStatus.investigating,
    },
  ];

  for (const incident of incidents) {
    const service = await prisma.service.findUniqueOrThrow({
      where: {
        name: incident.service,
      },
    });

    const existingIncident = await prisma.incident.findFirst({
      where: {
        title: incident.title,
        serviceId: service.id,
      },
    });

    const incidentData = {
      title: incident.title,
      description: incident.description,
      serviceId: service.id,
      severity: incident.severity,
      status: incident.status,
    };

    if (existingIncident) {
      await prisma.incident.update({
        where: {
          id: existingIncident.id,
        },
        data: incidentData,
      });
    } else {
      await prisma.incident.create({
        data: incidentData,
      });
    }
  }

  console.log('Seed data has been applied.');
}

void main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export {};
