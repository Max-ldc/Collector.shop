import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ArticleList from './ArticleList';
import { useArticles } from '../../hooks/useArticles';
import { ArticleStatus } from '../../types/article.types';

vi.mock('../../hooks/useArticles');
vi.mock('./ArticleCard', () => ({
    default: ({ article }: any) => <div data-testid="article-card">{article.title}</div>
}));

describe('ArticleList Component', () => {
    it('shows loading state', () => {
        (useArticles as any).mockReturnValue({
            articles: [],
            loading: true,
            error: null
        });

        render(<ArticleList />);
        expect(screen.getByText(/Loading articles.../i)).toBeInTheDocument();
    });

    it('shows error state', () => {
        (useArticles as any).mockReturnValue({
            articles: [],
            loading: false,
            error: 'Network Error'
        });

        render(<ArticleList />);
        expect(screen.getByText(/Error loading articles: Network Error/i)).toBeInTheDocument();
    });

    it('renders articles list', () => {
        const mockArticles = [
            { id: '1', title: 'Article 1', status: ArticleStatus.VALIDATED, description: 'desc1', price: 10, category: 'cat1', sellerId: 's1', createdAt: new Date() },
            { id: '2', title: 'Article 2', status: ArticleStatus.VALIDATED, description: 'desc2', price: 20, category: 'cat2', sellerId: 's2', createdAt: new Date() }
        ];

        (useArticles as any).mockReturnValue({
            articles: mockArticles,
            loading: false,
            error: null
        });

        render(<ArticleList />);

        expect(screen.getByText('Articles en vente')).toBeInTheDocument();
        const cards = screen.getAllByTestId('article-card');
        expect(cards).toHaveLength(2);
        expect(cards[0]).toHaveTextContent('Article 1');
    });
});
