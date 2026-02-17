import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article, ArticleStatus } from './entities/article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { ContentAnalyzerService } from '../shared/security/content-analyzer.service';

@Injectable()
export class ArticlesService {
    constructor(
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>,
        private readonly contentAnalyzerService: ContentAnalyzerService,
    ) { }

    async create(createArticleDto: CreateArticleDto, sellerId: string): Promise<Article> {
        const isSuspicious = this.contentAnalyzerService.containsRestrictedContent(
            createArticleDto.description,
        );

        const article = this.articleRepository.create({
            ...createArticleDto,
            sellerId,
            status: ArticleStatus.PENDING, // Default as per requirements
            isFlagged: isSuspicious,
        });

        return this.articleRepository.save(article);
    }

    async validate(id: string): Promise<Article> {
        const article = await this.articleRepository.findOne({ where: { id } });
        if (!article) {
            throw new NotFoundException(`Article with ID ${id} not found`);
        }

        article.status = ArticleStatus.VALIDATED;
        return this.articleRepository.save(article);
    }

    async findAllValidated(): Promise<Article[]> {
        return this.articleRepository.find({
            where: { status: ArticleStatus.VALIDATED },
        });
    }

    async findAllPending(): Promise<Article[]> {
        return this.articleRepository.find({
            where: { status: ArticleStatus.PENDING },
        });
    }

    async remove(id: string, sellerId: string): Promise<void> {
        const article = await this.articleRepository.findOne({ where: { id } });
        if (!article) {
            throw new NotFoundException(`Article with ID ${id} not found`);
        }
        await this.articleRepository.remove(article);
    }
}
