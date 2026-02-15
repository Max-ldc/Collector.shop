import { Module, MiddlewareConsumer, RequestMethod, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeycloakConnectModule, AuthGuard, RoleGuard, TokenValidation, ResourceGuard } from 'nest-keycloak-connect';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { DebugGuard } from './debug.guard';
import { ArticlesModule } from './articles/articles.module';
import { LoggerModule } from 'nestjs-pino';
import {
  PrometheusModule,
  makeHistogramProvider,
  makeCounterProvider,
} from '@willsoto/nestjs-prometheus';
import { MetricsInterceptor } from './observability/metrics.interceptor';
import { CustomPrometheusController } from './observability/prometheus.controller';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty' }
          : undefined,
        // Azure Log Analytics compatibility
        formatters: {
          level: (label) => {
            return { level: label };
          },
        },
      },
    }),
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
      controller: CustomPrometheusController,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: Number.parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'collector',
      password: process.env.DATABASE_PASSWORD || 'collector',
      database: process.env.DATABASE_NAME || 'collector_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production', // Set to false in production
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }),
    KeycloakConnectModule.register({
      authServerUrl: process.env.KEYCLOAK_URL,
      realm: process.env.KEYCLOAK_REALM || 'collector',
      clientId: process.env.KEYCLOAK_CLIENT_ID || 'backend-client',
      secret: process.env.KEYCLOAK_SECRET || 'secret',
      // Strict validation for production security
      tokenValidation: TokenValidation.OFFLINE,
      logLevels: ['verbose'], // Enable detailed logging
      useNestLogger: true,
    }),
    ArticlesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Establishing global guards
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: DebugGuard, // Inspects the user object populated by AuthGuard
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: ResourceGuard,
    // },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    // Metrics Providers
    makeHistogramProvider({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 1.5, 2, 3, 5, 10],
    }),
    makeCounterProvider({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'code'],
    }),
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req, res, next) => {
        console.log(`[RequestLogger] ${req.method} ${req.originalUrl}`);
        if (req.headers.authorization) {
          console.log(`[RequestLogger] Authorization Header: ${req.headers.authorization}`);
        } else {
          console.log('[RequestLogger] Authorization Header: MISSING');
        }
        next();
      })
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
