import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ArticlesService } from './articles.service';
import { Article, ArticleStatus } from './entities/article.entity';
import { ContentAnalyzerService } from '../shared/security/content-analyzer.service';
import { CreateArticleDto } from './dto/create-article.dto';

describe('ArticlesService', () => {
    let service: ArticlesService;
    let repository: jest.Mocked<Repository<Article>>;
    let contentAnalyzer: jest.Mocked<ContentAnalyzerService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ArticlesService,
                {
                    provide: getRepositoryToken(Article),
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        find: jest.fn(),
                        findOne: jest.fn(),
                        remove: jest.fn(),
                    },
                },
                {
                    provide: ContentAnalyzerService,
                    useValue: {
                        containsRestrictedContent: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<ArticlesService>(ArticlesService);
        repository = module.get(getRepositoryToken(Article));
        contentAnalyzer = module.get(ContentAnalyzerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const createArticleDto: CreateArticleDto = {
            title: 'Test Article',
            description: 'A valid description without restricted content',
            price: 29.99,
            category: 'Electronics',
        };
        const sellerId = 'user-123';

        it('should create an article with PENDING status and isFlagged=false when content is clean', async () => {
            contentAnalyzer.containsRestrictedContent.mockReturnValue(false);

            const createdArticle = {
                ...createArticleDto,
                sellerId,
                status: ArticleStatus.PENDING,
                isFlagged: false,
            } as Article;

            repository.create.mockReturnValue(createdArticle);
            repository.save.mockResolvedValue({ ...createdArticle, id: 'uuid-1' } as Article);

            const result = await service.create(createArticleDto, sellerId);

            expect(contentAnalyzer.containsRestrictedContent).toHaveBeenCalledWith(createArticleDto.description);
            expect(repository.create).toHaveBeenCalledWith({
                ...createArticleDto,
                sellerId,
                status: ArticleStatus.PENDING,
                isFlagged: false,
            });
            expect(repository.save).toHaveBeenCalledWith(createdArticle);
            expect(result.id).toBe('uuid-1');
        });

        it('should flag an article when content contains restricted content', async () => {
            const dtoWithEmail: CreateArticleDto = {
                ...createArticleDto,
                description: 'Contact me at test@example.com',
            };

            contentAnalyzer.containsRestrictedContent.mockReturnValue(true);

            const flaggedArticle = {
                ...dtoWithEmail,
                sellerId,
                status: ArticleStatus.PENDING,
                isFlagged: true,
            } as Article;

            repository.create.mockReturnValue(flaggedArticle);
            repository.save.mockResolvedValue({ ...flaggedArticle, id: 'uuid-2' } as Article);

            const result = await service.create(dtoWithEmail, sellerId);

            expect(contentAnalyzer.containsRestrictedContent).toHaveBeenCalledWith(dtoWithEmail.description);
            expect(repository.create).toHaveBeenCalledWith({
                ...dtoWithEmail,
                sellerId,
                status: ArticleStatus.PENDING,
                isFlagged: true,
            });
            expect(result.isFlagged).toBe(true);
        });
    });

    describe('validate', () => {
        it('should validate an existing article', async () => {
            const article = {
                id: 'uuid-1',
                title: 'Test',
                description: 'desc',
                price: 10,
                category: 'Cat',
                status: ArticleStatus.PENDING,
                isFlagged: false,
                sellerId: 'user-1',
            } as Article;

            repository.findOne.mockResolvedValue(article);
            repository.save.mockResolvedValue({ ...article, status: ArticleStatus.VALIDATED } as Article);

            const result = await service.validate('uuid-1');

            expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
            expect(result.status).toBe(ArticleStatus.VALIDATED);
        });

        it('should throw NotFoundException when article does not exist', async () => {
            repository.findOne.mockResolvedValue(null);

            await expect(service.validate('non-existent-id')).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAllValidated', () => {
        it('should return only validated articles', async () => {
            const validatedArticles = [
                { id: 'uuid-1', status: ArticleStatus.VALIDATED },
                { id: 'uuid-2', status: ArticleStatus.VALIDATED },
            ] as Article[];

            repository.find.mockResolvedValue(validatedArticles);

            const result = await service.findAllValidated();

            expect(repository.find).toHaveBeenCalledWith({
                where: { status: ArticleStatus.VALIDATED },
            });
            expect(result).toHaveLength(2);
        });

        it('should return an empty array when no validated articles exist', async () => {
            repository.find.mockResolvedValue([]);

            const result = await service.findAllValidated();

            expect(result).toEqual([]);
        });
    });

    describe('findAllPending', () => {
        it('should return only pending articles', async () => {
            const pendingArticles = [
                { id: 'uuid-3', status: ArticleStatus.PENDING },
            ] as Article[];

            repository.find.mockResolvedValue(pendingArticles);

            const result = await service.findAllPending();

            expect(repository.find).toHaveBeenCalledWith({
                where: { status: ArticleStatus.PENDING },
            });
            expect(result).toHaveLength(1);
        });
    });

    describe('remove', () => {
        it('should remove an existing article', async () => {
            const article = {
                id: 'uuid-1',
                title: 'Test',
                description: 'desc',
                price: 10,
                category: 'Cat',
                status: ArticleStatus.PENDING,
                isFlagged: false,
                sellerId: 'user-1',
            } as Article;

            repository.findOne.mockResolvedValue(article);
            repository.remove.mockResolvedValue(article);

            await service.remove('uuid-1', 'user-1');

            expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
            expect(repository.remove).toHaveBeenCalledWith(article);
        });

        it('should throw NotFoundException when article does not exist', async () => {
            repository.findOne.mockResolvedValue(null);

            await expect(service.remove('non-existent-id', 'user-1')).rejects.toThrow(NotFoundException);
        });
    });
});
