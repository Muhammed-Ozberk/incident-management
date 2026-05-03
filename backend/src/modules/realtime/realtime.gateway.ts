import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import {
  INCIDENT_CREATED_EVENT,
  INCIDENT_DELETED_EVENT,
  INCIDENT_UPDATED_EVENT,
  IncidentCreatedEvent,
  IncidentDeletedEvent,
  IncidentUpdatedEvent,
} from '../incidents/domain/incident.events';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private readonly server!: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Socket connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Socket disconnected: ${client.id}`);
  }

  publishIncidentCreated(payload: IncidentCreatedEvent) {
    this.server.emit(INCIDENT_CREATED_EVENT, payload);
  }

  publishIncidentUpdated(payload: IncidentUpdatedEvent) {
    this.server.emit(INCIDENT_UPDATED_EVENT, payload);
  }

  publishIncidentDeleted(payload: IncidentDeletedEvent) {
    this.server.emit(INCIDENT_DELETED_EVENT, payload);
  }
}
