import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class DebugGuard implements CanActivate {
    private readonly logger = new Logger(DebugGuard.name);

    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        this.logger.log(`[DebugGuard] User contents: ${JSON.stringify(user, null, 2)}`);

        if (user && user.realm_access) {
            this.logger.log(`[DebugGuard] Realm Roles: ${JSON.stringify(user.realm_access.roles)}`);
        }

        if (user && user.resource_access) {
            this.logger.log(`[DebugGuard] Resource Access: ${JSON.stringify(user.resource_access)}`);
        }

        return true; // Always pass, this is just for logging
    }
}
