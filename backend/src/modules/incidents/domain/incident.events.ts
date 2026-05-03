import { Incident } from './incident.types';

export const INCIDENT_CREATED_EVENT = 'incident.created';
export const INCIDENT_UPDATED_EVENT = 'incident.updated';
export const INCIDENT_DELETED_EVENT = 'incident.deleted';

export interface IncidentDeletedEvent {
  id: string;
}

export type IncidentCreatedEvent = Incident;
export type IncidentUpdatedEvent = Incident;

