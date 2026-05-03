import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  INCIDENT_CREATED_EVENT,
  INCIDENT_DELETED_EVENT,
  INCIDENT_UPDATED_EVENT,
  IncidentCreatedEvent,
  IncidentDeletedEvent,
  IncidentUpdatedEvent,
} from '../incidents/domain/incident.events';
import { RealtimeGateway } from './realtime.gateway';

@Injectable()
export class RealtimePublisher {
  constructor(private readonly realtimeGateway: RealtimeGateway) {}

  @OnEvent(INCIDENT_CREATED_EVENT)
  handleIncidentCreated(payload: IncidentCreatedEvent) {
    this.realtimeGateway.publishIncidentCreated(payload);
  }

  @OnEvent(INCIDENT_UPDATED_EVENT)
  handleIncidentUpdated(payload: IncidentUpdatedEvent) {
    this.realtimeGateway.publishIncidentUpdated(payload);
  }

  @OnEvent(INCIDENT_DELETED_EVENT)
  handleIncidentDeleted(payload: IncidentDeletedEvent) {
    this.realtimeGateway.publishIncidentDeleted(payload);
  }
}
