import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ArticleManagement from './ArticleManagement';
import { fetchPendingArticles, fetchValidatedArticles, validateArticle, rejectArticle } from '../../services/articles.service';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';

vi.mock('../../services/articles.service', () => ({
    fetchPendingArticles: vi.fn(),
    fetchValidatedArticles: vi.fn(),
    validateArticle: vi.fn(),
    rejectArticle: vi.fn(),
}));

describe('ArticleManagement', () => {
    const mockPending = [
        { id: '1', title: 'Pending Art 1', status: 'pending', description: 'desc1', price: 10, category: 'cat1', sellerId: 'a1', createdAt: '...', updatedAt: '...' },
        { id: '2', title: 'Pending Art 2', status: 'pending', description: 'desc2', price: 20, category: 'cat2', sellerId: 'a2', createdAt: '...', updatedAt: '...' },
    ];
    const mockValidated = [
        { id: '3', title: 'Valid Art 3', status: 'validated', description: 'desc3', price: 30, category: 'cat3', sellerId: 'a3', createdAt: '...', updatedAt: '...' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (fetchPendingArticles as Mock).mockResolvedValue(mockPending);
        (fetchValidatedArticles as Mock).mockResolvedValue(mockValidated);
    });

    it('should load and display articles on mount', async () => {
        render(<ArticleManagement />);

        await waitFor(() => {
            expect(screen.getByText('Pending Art 1')).toBeInTheDocument();
            expect(screen.getByText('Pending Art 2')).toBeInTheDocument();
            expect(screen.getByText('Valid Art 3')).toBeInTheDocument();
        });

        expect(fetchPendingArticles).toHaveBeenCalled();
        expect(fetchValidatedArticles).toHaveBeenCalled();
    });

    it('should validate an article', async () => {
        (validateArticle as Mock).mockResolvedValue({ ...mockPending[0], status: 'validated' });

        render(<ArticleManagement />);

        await waitFor(() => expect(screen.getByText('Pending Art 1')).toBeInTheDocument());

        const validateButtons = screen.getAllByText('Validate');
        fireEvent.click(validateButtons[0]); // Click validate for the first pending item

        await waitFor(() => {
            expect(validateArticle).toHaveBeenCalledWith('1');
            // Should move to validated list (simplistic check: logic moves it in state)
            // Ideally we check call and maybe disappearance from pending list if we can distinguish lists
        });
    });

    it('should reject an article', async () => {
        (rejectArticle as Mock).mockResolvedValue(undefined);

        render(<ArticleManagement />);

        await waitFor(() => expect(screen.getByText('Pending Art 2')).toBeInTheDocument());

        // Find the reject button for the second article... 
        // Or just click the first one available

        // Let's refine. The first item is ID 1.
        const rejectBtn = screen.getAllByText('Reject')[0];
        fireEvent.click(rejectBtn);

        await waitFor(() => {
            expect(rejectArticle).toHaveBeenCalledWith('1');
        });
    });
});
