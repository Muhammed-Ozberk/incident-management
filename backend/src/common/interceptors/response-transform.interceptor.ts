import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

interface ApiSuccessResponse<T> {
  status: true;
  message: string;
  data: T;
}

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, ApiSuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiSuccessResponse<T>> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data: T) => ({
        status: true,
        message: this.getSuccessMessage(request.method, request.route?.path),
        data,
      })),
    );
  }

  private getSuccessMessage(method: string, routePath?: string): string {
    const normalizedRoute = routePath ?? '';

    if (normalizedRoute.includes('incidents')) {
      if (normalizedRoute.includes('stats')) {
        return 'Incident statistics retrieved successfully';
      }

      if (normalizedRoute.includes('ai-suggest')) {
        return 'AI suggestions generated successfully';
      }

      if (normalizedRoute.includes('ai-summary')) {
        return 'AI summary retrieved successfully';
      }

      switch (method) {
        case 'POST':
          return 'Incident created successfully';
        case 'PATCH':
          return 'Incident updated successfully';
        case 'DELETE':
          return 'Incident deleted successfully';
        case 'GET':
          return normalizedRoute.includes(':id')
            ? 'Incident retrieved successfully'
            : 'Incidents retrieved successfully';
        default:
          return 'Request completed successfully';
      }
    }

    if (normalizedRoute.includes('services')) {
      switch (method) {
        case 'POST':
          return 'Service created successfully';
        case 'PATCH':
          return 'Service updated successfully';
        case 'DELETE':
          return 'Service deactivated successfully';
        case 'GET':
          return normalizedRoute.includes(':id')
            ? 'Service retrieved successfully'
            : 'Services retrieved successfully';
        default:
          return 'Request completed successfully';
      }
    }

    return 'Request completed successfully';
  }
}
