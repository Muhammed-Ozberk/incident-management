import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { IncidentSeverity, IncidentStatus } from '../src/modules/incidents/domain/incident.enums';

describe('Incidents (e2e)', () => {
  let app: INestApplication;
  let serviceId: string;
  let incidentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    const serviceResponse = await request(app.getHttpServer())
      .post('/services')
      .send({
        name: `E2E Service ${Date.now()}`,
        description: 'Service created by e2e tests',
      })
      .expect(201);

    serviceId = serviceResponse.body.data.id;
  });

  afterAll(async () => {
    if (incidentId) {
      await request(app.getHttpServer()).delete(`/incidents/${incidentId}`);
    }

    if (serviceId) {
      await request(app.getHttpServer()).delete(`/services/${serviceId}`);
    }

    await app.close();
  });

  describe('/incidents (GET)', () => {
    it('should return a paginated list of incidents', () => {
      return request(app.getHttpServer())
        .get('/incidents')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(true);
          expect(res.body.data.items).toBeInstanceOf(Array);
          expect(res.body.data.meta).toBeDefined();
        });
    });
  });

  describe('/incidents (POST)', () => {
    it('should create a new incident', () => {
      const payload = {
        title: 'E2E Test Incident',
        description: 'Created via E2E test',
        serviceId,
        severity: IncidentSeverity.LOW,
      };

      return request(app.getHttpServer())
        .post('/incidents')
        .send(payload)
        .expect(201)
        .expect((res) => {
          expect(res.body.status).toBe(true);
          expect(res.body.data.title).toBe(payload.title);
          expect(res.body.data.id).toBeDefined();
          expect(res.body.data.serviceId).toBe(serviceId);
          incidentId = res.body.data.id;
        });
    });

    it('should fail if title is missing', () => {
      return request(app.getHttpServer())
        .post('/incidents')
        .send({ serviceId, severity: IncidentSeverity.LOW })
        .expect(400);
    });
  });

  describe('/incidents/:id (PATCH)', () => {
    it('should update incident status', () => {
      return request(app.getHttpServer())
        .patch(`/incidents/${incidentId}`)
        .send({ status: IncidentStatus.RESOLVED })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(true);
          expect(res.body.data.status).toBe(IncidentStatus.RESOLVED);
        });
    });
  });

  describe('/incidents/stats (GET)', () => {
    it('should return global stats', () => {
      return request(app.getHttpServer())
        .get('/incidents/stats')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(true);
          expect(res.body.data).toHaveProperty('total');
          expect(res.body.data).toHaveProperty('open');
        });
    });
  });
});
