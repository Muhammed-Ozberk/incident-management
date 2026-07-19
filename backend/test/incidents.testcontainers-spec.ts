import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import * as path from 'node:path';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { IncidentSeverity } from '../src/modules/incidents/domain/incident.enums';

const execFileAsync = promisify(execFile);

describe('Incidents with PostgreSQL (Testcontainers)', () => {
  let app: INestApplication | undefined;
  let postgres: StartedPostgreSqlContainer | undefined;
  const originalDatabaseUrl = process.env.DATABASE_URL;

  beforeAll(async () => {
    postgres = await new PostgreSqlContainer('postgres:16-alpine')
      .withDatabase('incidents_test')
      .withUsername('postgres')
      .withPassword('postgres')
      .start();

    process.env.DATABASE_URL = postgres.getConnectionUri();

    await execFileAsync(
      process.execPath,
      [require.resolve('prisma/build/index.js'), 'migrate', 'deploy'],
      {
        cwd: path.resolve(__dirname, '..'),
        env: process.env,
      },
    );

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    await postgres?.stop();

    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }
  });

  it('persists an incident in an isolated PostgreSQL container', async () => {
    if (!app) {
      throw new Error('Nest application was not initialized');
    }

    const serviceResponse = await request(app.getHttpServer())
      .post('/services')
      .send({
        name: 'Testcontainers Payment API',
        description: 'Ephemeral integration-test service',
      })
      .expect(201);

    const incidentResponse = await request(app.getHttpServer())
      .post('/incidents')
      .send({
        title: 'PostgreSQL integration incident',
        description: 'Persisted in a disposable PostgreSQL container',
        serviceId: serviceResponse.body.data.id,
        severity: IncidentSeverity.HIGH,
      })
      .expect(201);

    const prisma = app.get(PrismaService);
    const persistedIncident = await prisma.incident.findUnique({
      where: { id: incidentResponse.body.data.id },
      include: { service: true },
    });

    expect(persistedIncident).toMatchObject({
      title: 'PostgreSQL integration incident',
      severity: IncidentSeverity.HIGH,
      service: { name: 'Testcontainers Payment API' },
    });
  });
});
