import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(3 * 60 * 1000), // Set timeout in milliseconds
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(() => new Error('Request timed out.'));
        }
        return throwError(() => err);
      })
    );
  }
}
