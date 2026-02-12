import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { Roles, AuthenticatedUser, Public } from 'nest-keycloak-connect';

@Controller('articles')
export class ArticlesController {
    constructor(private readonly articlesService: ArticlesService) { }

    @Post()
    @Roles({ roles: ['ROLE_SELLER'] })
    create(@Body() createArticleDto: CreateArticleDto, @AuthenticatedUser() user: any) {
        console.log('--- ENTERING CONTROLLER ---');
        console.log('User:', user);
        console.log('Payload:', createArticleDto);

        // Fallback if Keycloak user is not injected properly
        const userId = user?.sub || 'anonymous-or-test-user';

        return this.articlesService.create(createArticleDto, userId);
    }

    @Patch(':id/validate')
    @Roles({ roles: ['ROLE_ADMIN'] })
    validate(@Param('id') id: string) {
        return this.articlesService.validate(id);
    }

    @Get()
    @Public()
    findAllValidated() {
        return this.articlesService.findAllValidated();
    }
}
