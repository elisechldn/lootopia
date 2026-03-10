import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { PaginatedResult, PaginationMeta } from '@repo/types';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ApiResponse<T> {
  data: T | T[];
  meta?: { pagination: PaginationMeta };
}

function isPaginatedResult<T>(value: unknown): value is PaginatedResult<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    'total' in value &&
    'page' in value &&
    'pageSize' in value &&
    Array.isArray((value as PaginatedResult<T>).data)
  );
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((value) => {
        if (isPaginatedResult<T>(value)) {
          const { data, total, page, pageSize } = value;
          const pageCount = Math.ceil(total / pageSize);
          return {
            data,
            meta: { pagination: { page, pageSize, total, pageCount } },
          };
        }
        return { data: value };
      }),
    );
  }
}
