import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    HttpCode,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { Roles, AuthenticatedUser, Public } from 'nest-keycloak-connect';

@Controller('articles')
export class ArticlesController {
    constructor(private readonly articlesService: ArticlesService) { }

    @Post()
    @Roles({ roles: ['realm:ROLE_SELLER', 'realm:ROLE_ADMIN'] })
    create(@Body() createArticleDto: CreateArticleDto, @AuthenticatedUser() user: any) {
        console.log('--- ENTERING CONTROLLER ---');
        console.log('User:', user);
        console.log('Payload:', createArticleDto);

        // Fallback if Keycloak user is not injected properly
        const userId = user?.sub || 'anonymous-or-test-user';

        return this.articlesService.create(createArticleDto, userId);
    }

    @Patch(':id/validate')
    @Roles({ roles: ['realm:ROLE_ADMIN'] })
    validate(@Param('id') id: string) {
        return this.articlesService.validate(id);
    }

    @Get('pending')
    @Roles({ roles: ['realm:ROLE_ADMIN'] })
    findPending() {
        return this.articlesService.findAllPending();
    }

    @Get()
    @Public()
    findAllValidated() {
        return this.articlesService.findAllValidated();
    }

    @Delete(':id')
    @Roles({ roles: ['realm:ROLE_SELLER', 'realm:ROLE_ADMIN'] })
    @HttpCode(204)
    remove(@Param('id') id: string, @AuthenticatedUser() user: any) {
        const userId = user?.sub || 'anonymous-or-test-user';
        return this.articlesService.remove(id, userId);
    }
}
