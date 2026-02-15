import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { Article, ArticleStatus } from './entities/article.entity';
import { META_ROLES } from 'nest-keycloak-connect'; // Import from library

describe('ArticlesController', () => {
    let controller: ArticlesController;
    let service: jest.Mocked<ArticlesService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ArticlesController],
            providers: [
                {
                    provide: ArticlesService,
                    useValue: {
                        create: jest.fn(),
                        validate: jest.fn(),
                        findAllValidated: jest.fn(),
                        findAllPending: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<ArticlesController>(ArticlesController);
        service = module.get(ArticlesService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should have correct roles for access control', () => {
            const rolesMetadata = Reflect.getMetadata(META_ROLES, controller.create);
            expect(rolesMetadata).toBeDefined();
            // The structure of metadata from nest-keycloak-connect might vary, usually it's { roles: [...] }
            expect(rolesMetadata.roles).toContain('realm:ROLE_SELLER');
            expect(rolesMetadata.roles).toContain('realm:ROLE_ADMIN');
        });

        it('should create an article with the authenticated user id', async () => {
            const dto: CreateArticleDto = {
                title: 'Test Article',
                description: 'A test description',
                price: 19.99,
                category: 'Books',
            };
            const user = { sub: 'user-123', preferred_username: 'john' };

            const expectedArticle = {
                id: 'uuid-1',
                ...dto,
                sellerId: 'user-123',
                status: ArticleStatus.PENDING,
                isFlagged: false,
            } as Article;

            service.create.mockResolvedValue(expectedArticle);

            const result = await controller.create(dto, user);

            expect(service.create).toHaveBeenCalledWith(dto, 'user-123');
            expect(result).toEqual(expectedArticle);
        });

        it('should use fallback user id when user.sub is not available', async () => {
            const dto: CreateArticleDto = {
                title: 'Test Article',
                description: 'A test description',
                price: 19.99,
                category: 'Books',
            };

            service.create.mockResolvedValue({} as Article);

            await controller.create(dto, {});

            expect(service.create).toHaveBeenCalledWith(dto, 'anonymous-or-test-user');
        });

        it('should use fallback user id when user is undefined', async () => {
            const dto: CreateArticleDto = {
                title: 'Test Article',
                description: 'A test description',
                price: 19.99,
                category: 'Books',
            };

            service.create.mockResolvedValue({} as Article);

            await controller.create(dto, undefined);

            expect(service.create).toHaveBeenCalledWith(dto, 'anonymous-or-test-user');
        });
    });

    describe('validate', () => {
        it('should validate an article by id', async () => {
            const validatedArticle = {
                id: 'uuid-1',
                status: ArticleStatus.VALIDATED,
            } as Article;

            service.validate.mockResolvedValue(validatedArticle);

            const result = await controller.validate('uuid-1');

            expect(service.validate).toHaveBeenCalledWith('uuid-1');
            expect(result.status).toBe(ArticleStatus.VALIDATED);
        });
    });

    describe('findPending', () => {
        it('should return all pending articles', async () => {
            const pendingArticles = [
                { id: 'uuid-1', status: ArticleStatus.PENDING },
            ] as Article[];

            service.findAllPending.mockResolvedValue(pendingArticles);

            const result = await controller.findPending();

            expect(service.findAllPending).toHaveBeenCalled();
            expect(result).toEqual(pendingArticles);
        });
    });

    describe('findAllValidated', () => {
        it('should return all validated articles', async () => {
            const articles = [
                { id: 'uuid-1', status: ArticleStatus.VALIDATED },
                { id: 'uuid-2', status: ArticleStatus.VALIDATED },
            ] as Article[];

            service.findAllValidated.mockResolvedValue(articles);

            const result = await controller.findAllValidated();

            expect(service.findAllValidated).toHaveBeenCalled();
            expect(result).toHaveLength(2);
        });
    });
});
