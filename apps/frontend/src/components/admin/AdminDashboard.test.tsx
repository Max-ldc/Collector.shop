import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import { describe, it, expect, vi } from 'vitest';
import * as articlesService from '../../services/articles.service';

// Mock the service
vi.mock('../../services/articles.service', () => ({
    fetchPendingArticles: vi.fn(),
    fetchValidatedArticles: vi.fn(),
    validateArticle: vi.fn(),
    rejectArticle: vi.fn()
}));

describe('AdminDashboard', () => {
    it('should render the dashboard structure', async () => {
        (articlesService.fetchPendingArticles as any).mockResolvedValue([]);
        (articlesService.fetchValidatedArticles as any).mockResolvedValue([]);

        render(
            <BrowserRouter>
                <AdminDashboard />
            </BrowserRouter>
        );

        expect(screen.getByText('Tableau de bord administrateur')).toBeInTheDocument();
        expect(screen.getByText('Articles en attente')).toBeInTheDocument();
        expect(screen.getByText('Articles validés')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Aucun article en attente de validation.')).toBeInTheDocument();
            expect(screen.getByText('Aucun article validé pour le moment.')).toBeInTheDocument();
        });
    });
});

