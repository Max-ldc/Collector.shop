import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { Article } from './entities/article.entity';
import { ContentAnalyzerService } from '../shared/security/content-analyzer.service';

@Module({
    imports: [TypeOrmModule.forFeature([Article])],
    controllers: [ArticlesController],
    providers: [ArticlesService, ContentAnalyzerService],
})
export class ArticlesModule { }
