import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ArticleCard from './ArticleCard';
import { ArticleStatus } from '../../types/article.types';

describe('ArticleCard Component', () => {
    const mockArticle = {
        id: '123',
        title: 'Test Title',
        description: 'Test Content Description',
        price: 15.5,
        category: 'Toys',
        sellerId: 'author-uuid',
        status: ArticleStatus.VALIDATED,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
    };

    it('renders article details correctly', () => {
        render(<ArticleCard article={mockArticle} />);

        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test Content Description')).toBeInTheDocument();
        expect(screen.getByText('15.5 €')).toBeInTheDocument();
        expect(screen.getByText('Toys')).toBeInTheDocument();
        // Seller label is displayed as "Vendeur: author-uuid"
        // expect(screen.getByText('Vendeur: author-uuid')).toBeInTheDocument();
    });
});
