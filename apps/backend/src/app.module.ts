import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeycloakConnectModule, AuthGuard, RoleGuard, ResourceGuard, TokenValidation } from 'nest-keycloak-connect';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticlesModule } from './articles/articles.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'collector',
      password: process.env.DATABASE_PASSWORD || 'collector',
      database: process.env.DATABASE_NAME || 'collector_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Note: Set to false in production
    }),
    KeycloakConnectModule.register({
      authServerUrl: process.env.KEYCLOAK_URL,
      realm: process.env.KEYCLOAK_REALM || 'collector-realm',
      clientId: process.env.KEYCLOAK_CLIENT_ID || 'backend-client',
      secret: process.env.KEYCLOAK_SECRET || 'secret',
      // Allow validation of tokens issued by localhost when verify-token-audience is enabled
      tokenValidation: TokenValidation.NONE,
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
