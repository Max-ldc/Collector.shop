import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Histogram, Counter } from 'prom-client';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
    constructor(
        @InjectMetric('http_request_duration_seconds')
        public histogram: Histogram<string>,
        @InjectMetric('http_requests_total')
        public counter: Counter<string>,
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const start = Date.now();
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        const method = request.method;
        const route = request.route ? request.route.path : request.url;

        return next.handle().pipe(
            tap(() => {
                const duration = (Date.now() - start) / 1000;
                const status = response.statusCode;

                this.histogram.labels(method, route, status.toString()).observe(duration);
                this.counter.labels(method, route, status.toString()).inc();
            }),
        );
    }
}
