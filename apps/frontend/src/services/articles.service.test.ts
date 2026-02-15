import { describe, it, expect, vi, beforeEach } from 'vitest';
import articlesService from './articles.service';
import axios from 'axios';
import { Article, ArticleStatus } from '../types/article.types';

vi.mock('axios');

describe('Articles Service', () => {
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

    it('fetches validated articles', async () => {
        (axios.get as any).mockResolvedValue({ data: mockArticles });

        const result = await articlesService.fetchValidatedArticles();

        expect(axios.get).toHaveBeenCalledWith(expect.stringMatching(/\/articles$/));
        expect(result).toEqual(mockArticles);
    });

    it('submits a new article', async () => {
        const newArticle = mockArticles[0];
        (axios.post as any).mockResolvedValue({ data: newArticle });

        const result = await articlesService.submitArticle(newArticle);

        expect(axios.post).toHaveBeenCalledWith(expect.stringMatching(/\/articles$/), newArticle);
        expect(result).toEqual(newArticle);
    });

    it('fetches pending articles', async () => {
        (axios.get as any).mockResolvedValue({ data: mockArticles });

        const result = await articlesService.fetchPendingArticles();

        expect(axios.get).toHaveBeenCalledWith(expect.stringMatching(/\/articles\/pending$/));
        expect(result).toEqual(mockArticles);
    });

    it('validates an article', async () => {
        const article = { ...mockArticles[0], status: ArticleStatus.VALIDATED };
        (axios.patch as any).mockResolvedValue({ data: article });

        const result = await articlesService.validateArticle('1');

        expect(axios.patch).toHaveBeenCalledWith(expect.stringMatching(/\/articles\/1\/validate$/));
        expect(result).toEqual(article);
    });

    it('rejects an article', async () => {
        const article = { ...mockArticles[0], status: ArticleStatus.REJECTED };
        (axios.delete as any).mockResolvedValue({ data: article });

        const result = await articlesService.rejectArticle('1');

        expect(axios.delete).toHaveBeenCalledWith(expect.stringMatching(/\/articles\/reject\/1$/));
        expect(result).toEqual(article);
    });
});
