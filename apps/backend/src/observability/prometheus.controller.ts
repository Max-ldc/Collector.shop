import { Controller, Get, Res } from '@nestjs/common';
import { PrometheusController } from '@willsoto/nestjs-prometheus';
import { Response } from 'express';
import { Public } from 'nest-keycloak-connect';

@Controller()
export class CustomPrometheusController extends PrometheusController {
    @Public()
    @Get()
    async index(@Res({ passthrough: true }) response: Response) {
        return super.index(response);
    }
}
