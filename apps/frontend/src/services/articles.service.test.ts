import { describe, it, expect, vi, beforeEach, beforeAll, Mock } from 'vitest';
import articlesService from './articles.service';
import axios from 'axios';
import keycloak from '../keycloak';
import { Article, ArticleStatus } from '../types/article.types';

vi.mock('axios', () => {
    return {
        default: {
            get: vi.fn(),
            post: vi.fn(),
            patch: vi.fn(),
            delete: vi.fn(),
            interceptors: {
                request: {
                    use: vi.fn(),
                    eject: vi.fn(),
                },
            },
        },
    };
});

vi.mock('../keycloak', () => {
    return {
        default: {
            authenticated: false,
            token: 'mock-token',
            updateToken: vi.fn(),
            login: vi.fn(),
        },
    };
});

describe('Articles Service', () => {
    let interceptorCallback: ((config: Record<string, Record<string, string>>) => Promise<void>) | undefined;

    beforeAll(() => {
        // Capture the interceptor callback that was registered when the module was imported
        const calls = (axios.interceptors.request.use as Mock).mock.calls;
        if (calls && calls.length > 0) {
            interceptorCallback = calls[0][0];
        }
    });

    const mockArticles: Article[] = [
        {
            id: '1',
            title: 'Test Article',
            description: 'Content',
            price: 100,
            category: 'Tech',
            sellerId: 'user1',
            status: ArticleStatus.VALIDATED,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('API Calls', () => {
        it('fetches validated articles', async () => {
            vi.mocked(axios.get).mockResolvedValue({ data: mockArticles });

            const result = await articlesService.fetchValidatedArticles();

            expect(axios.get).toHaveBeenCalledWith(expect.stringMatching(/\/articles$/));
            expect(result).toEqual(mockArticles);
        });

        it('submits a new article', async () => {
            const newArticle = mockArticles[0];
            vi.mocked(axios.post).mockResolvedValue({ data: newArticle });

            const result = await articlesService.submitArticle(newArticle);

            expect(axios.post).toHaveBeenCalledWith(expect.stringMatching(/\/articles$/), newArticle);
            expect(result).toEqual(newArticle);
        });

        it('fetches pending articles', async () => {
            vi.mocked(axios.get).mockResolvedValue({ data: mockArticles });

            const result = await articlesService.fetchPendingArticles();

            expect(axios.get).toHaveBeenCalledWith(expect.stringMatching(/\/articles\/pending$/));
            expect(result).toEqual(mockArticles);
        });

        it('validates an article', async () => {
            const article = { ...mockArticles[0], status: ArticleStatus.VALIDATED };
            vi.mocked(axios.patch).mockResolvedValue({ data: article });

            const result = await articlesService.validateArticle('1');

            expect(axios.patch).toHaveBeenCalledWith(expect.stringMatching(/\/articles\/1\/validate$/));
            expect(result).toEqual(article);
        });

        it('rejects an article', async () => {
            vi.mocked(axios.delete).mockResolvedValue({ status: 204 });

            await articlesService.rejectArticle('1');

            expect(axios.delete).toHaveBeenCalledWith(expect.stringMatching(/\/articles\/1$/));
        });
    });

    describe('Interceptors', () => {
        it('should add authorization header if authenticated', async () => {
            if (!interceptorCallback) {
                // If it wasn't captured before mocks were cleared, this means something went wrong with init
                const calls = (axios.interceptors.request.use as Mock).mock.calls;
                if (calls && calls.length > 0) interceptorCallback = calls[0][0];
            }

            keycloak.authenticated = true;
            keycloak.token = 'test-token';
            vi.mocked(keycloak.updateToken).mockResolvedValue(true);

            const config = { headers: {} };

            // Only run if we actually captured the interceptor
            if (interceptorCallback) {
                await interceptorCallback(config);
                expect(keycloak.updateToken).toHaveBeenCalledWith(30);
                expect(config.headers['Authorization']).toBe('Bearer test-token');
            }
        });

        it('should not add header if not authenticated', async () => {
            keycloak.authenticated = false;
            const config = { headers: {} };

            if (interceptorCallback) {
                await interceptorCallback(config);
                expect(keycloak.updateToken).not.toHaveBeenCalled();
                expect(config.headers['Authorization']).toBeUndefined();
            }
        });

        it('should login if token refresh fails', async () => {
            keycloak.authenticated = true;
            vi.mocked(keycloak.updateToken).mockRejectedValue(new Error('Refresh failed'));

            const config = { headers: {} };

            if (interceptorCallback) {
                await interceptorCallback(config);
                expect(keycloak.login).toHaveBeenCalled();
            }
        });
    });
});
