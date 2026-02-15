import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeycloakConnectModule, AuthGuard, RoleGuard, TokenValidation } from 'nest-keycloak-connect';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
      synchronize: true, // Note: Set to false in production
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }),
    KeycloakConnectModule.register({
      authServerUrl: process.env.KEYCLOAK_URL,
      realm: process.env.KEYCLOAK_REALM || 'collector-realm',
      clientId: process.env.KEYCLOAK_CLIENT_ID || 'collector-backend',
      secret: process.env.KEYCLOAK_SECRET || 'secret',
      // Strict validation for production security
      tokenValidation: TokenValidation.ONLINE,
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
export class AppModule { }
