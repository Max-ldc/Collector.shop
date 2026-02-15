import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
        // Seller label is displayed as "Vendeur: author-uuid" - Wait, user said "N'affiche pas le nom/id du vendeur"
        // So checking for absence might be good if it was removed
        expect(screen.queryByText('author-uuid')).not.toBeInTheDocument();
    });

    it('handles hover effects', () => {
        render(<ArticleCard article={mockArticle} />);
        const card = screen.getByText('Test Title').closest('.article-card');
        
        // We can't really check inline styles easily with just fireEvent unless we check the element style attribute
        // But we can ensure the event handler doesn't crash
        if (card) {
            fireEvent.mouseEnter(card);
            expect(card).toHaveStyle('transform: translateY(-5px)');
            
            fireEvent.mouseLeave(card);
            expect(card).toHaveStyle('transform: translateY(0)');
        } else {
            throw new Error('Card not found');
        }
    });
});
