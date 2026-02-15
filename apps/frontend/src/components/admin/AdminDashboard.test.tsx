import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as articlesService from '../../services/articles.service';
import { Article, ArticleStatus } from '../../types/article.types';

// Mock the service
vi.mock('../../services/articles.service', () => ({
    fetchPendingArticles: vi.fn(),
    fetchValidatedArticles: vi.fn(),
    validateArticle: vi.fn(),
    rejectArticle: vi.fn()
}));

const mockPendingArticle: Article = {
    id: 'pending-1',
    title: 'Pending Article',
    description: 'Description', 
    price: 100, 
    category: 'Test', 
    sellerId: 'user1',
    status: ArticleStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date()
};

const mockValidatedArticle: Article = {
    id: 'validated-1',
    title: 'Validated Article',
    description: 'Description', 
    price: 200, 
    category: 'Test', 
    sellerId: 'user2',
    status: ArticleStatus.VALIDATED,
    createdAt: new Date(),
    updatedAt: new Date()
};

describe('AdminDashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render the dashboard structure and empty states', async () => {
        (articlesService.fetchPendingArticles as any).mockResolvedValue([]);
        (articlesService.fetchValidatedArticles as any).mockResolvedValue([]);

        render(
            <BrowserRouter>
                <AdminDashboard />
            </BrowserRouter>
        );

        expect(screen.getByText('Tableau de bord administrateur')).toBeInTheDocument();
        
        await waitFor(() => {
            expect(screen.getByText('Aucun article en attente de validation.')).toBeInTheDocument();
            expect(screen.getByText('Aucun article validé pour le moment.')).toBeInTheDocument();
        });
    });

    it('should display fetched articles', async () => {
        (articlesService.fetchPendingArticles as any).mockResolvedValue([mockPendingArticle]);
        (articlesService.fetchValidatedArticles as any).mockResolvedValue([mockValidatedArticle]);

        render(
            <BrowserRouter>
                <AdminDashboard />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Pending Article')).toBeInTheDocument();
            expect(screen.getByText('Validated Article')).toBeInTheDocument();
        });
    });

    it('should validate an article', async () => {
        (articlesService.fetchPendingArticles as any).mockResolvedValue([mockPendingArticle]);
        (articlesService.fetchValidatedArticles as any).mockResolvedValue([]);
        (articlesService.validateArticle as any).mockResolvedValue({ ...mockPendingArticle, status: ArticleStatus.VALIDATED });

        render(
            <BrowserRouter>
                <AdminDashboard />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Pending Article')).toBeInTheDocument();
        });

        const validateButton = screen.getByText('Valider');
        fireEvent.click(validateButton);

        await waitFor(() => {
            expect(articlesService.validateArticle).toHaveBeenCalledWith('pending-1');
            expect(screen.queryByText('Aucun article validé pour le moment.')).not.toBeInTheDocument();
        });
    });

    it('should reject an article', async () => {
        (articlesService.fetchPendingArticles as any).mockResolvedValue([mockPendingArticle]);
        (articlesService.fetchValidatedArticles as any).mockResolvedValue([]);
        (articlesService.rejectArticle as any).mockResolvedValue({ ...mockPendingArticle, status: ArticleStatus.REJECTED });

        render(
            <BrowserRouter>
                <AdminDashboard />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Pending Article')).toBeInTheDocument();
        });

        const rejectButton = screen.getByText('Rejeter');
        fireEvent.click(rejectButton);

        await waitFor(() => {
            expect(articlesService.rejectArticle).toHaveBeenCalledWith('pending-1');
            expect(screen.queryByText('Pending Article')).not.toBeInTheDocument();
        });
    });
    
    it('should handle load error', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        (articlesService.fetchPendingArticles as any).mockRejectedValue(new Error('Fetch failed'));
        (articlesService.fetchValidatedArticles as any).mockResolvedValue([]);

        render(
            <BrowserRouter>
                <AdminDashboard />
            </BrowserRouter>
        );
        
        await waitFor(() => {
             expect(consoleSpy).toHaveBeenCalledWith("Failed to load articles", expect.any(Error));
        });
        consoleSpy.mockRestore();
    });
});
