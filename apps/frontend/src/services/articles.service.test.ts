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
            content: 'Content',
            authorId: 'user1',
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

        expect(axios.get).toHaveBeenCalledWith('/api/articles');
        expect(result).toEqual(mockArticles);
    });

    it('submits a new article', async () => {
        const newArticle = mockArticles[0];
        (axios.post as any).mockResolvedValue({ data: newArticle });

        const result = await articlesService.submitArticle(newArticle);

        expect(axios.post).toHaveBeenCalledWith('/api/articles', newArticle);
        expect(result).toEqual(newArticle);
    });
});
