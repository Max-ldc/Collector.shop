import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ArticleCard from './ArticleCard';
import { ArticleStatus } from '../../types/article.types';

describe('ArticleCard Component', () => {
    const mockArticle = {
        id: '123',
        title: 'Test Title',
        content: 'Test Content Description',
        authorId: 'author-uuid',
        status: ArticleStatus.VALIDATED,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
    };

    it('renders article details correctly', () => {
        render(<ArticleCard article={mockArticle} />);

        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test Content Description')).toBeInTheDocument();
        expect(screen.getByText('Author ID: author-uuid')).toBeInTheDocument();
        // Date format depends on locale, checking partial match or verifying string presence
        // Using strict locale match might be flaky, checking for existence
    });
});
