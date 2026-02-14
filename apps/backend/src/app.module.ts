import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeycloakConnectModule, AuthGuard, RoleGuard, TokenValidation } from 'nest-keycloak-connect';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticlesModule } from './articles/articles.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: Number.parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'collector',
      password: process.env.DATABASE_PASSWORD || 'collector',
      database: process.env.DATABASE_NAME || 'collector_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Note: Set to false in production
      ssl: { rejectUnauthorized: false }, // Force SSL for Azure PG
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
    // {
    //   provide: APP_GUARD,
    //   useClass: ResourceGuard,
    // },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule { }
