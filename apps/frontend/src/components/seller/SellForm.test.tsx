import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SellForm from './SellForm';
import { articlesService } from '../../services/articles.service';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';

// Mock dependencies
vi.mock('../../services/articles.service', () => ({
    articlesService: {
        submitArticle: vi.fn(),
    },
}));

describe('SellForm', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render the form correctly', () => {
        render(<SellForm />);
        expect(screen.getByText('Vendre un article')).toBeInTheDocument();
        expect(screen.getByLabelText(/Titre/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Catégorie/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Prix/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: "Soumettre l'article" })).toBeInTheDocument();
    });

    it('should submit the form successfully with valid data', async () => {
        (articlesService.submitArticle as Mock).mockResolvedValue({ id: '1', title: 'Test Article' });

        render(<SellForm />);

        fireEvent.change(screen.getByLabelText(/Titre/i), { target: { value: 'Mon Article Valide' } });
        fireEvent.change(screen.getByLabelText(/Catégorie/i), { target: { value: 'Vêtements' } });
        fireEvent.change(screen.getByLabelText(/Prix/i), { target: { value: '20' } });
        fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Une belle description' } });

        fireEvent.click(screen.getByRole('button', { name: "Soumettre l'article" }));

        await waitFor(() => {
            expect(articlesService.submitArticle).toHaveBeenCalledWith({
                title: 'Mon Article Valide',
                description: 'Une belle description',
                price: 20,
                category: 'Vêtements',
            });
            expect(screen.getByText('Article soumis avec succès !')).toBeInTheDocument();
            // Fields cleared
            expect(screen.getByLabelText(/Titre/i)).toHaveValue('');
        });
    });

    it('should show error when title is too short', async () => {
        render(<SellForm />);

        fireEvent.change(screen.getByLabelText(/Titre/i), { target: { value: '1234' } }); // < 5 chars
        fireEvent.change(screen.getByLabelText(/Catégorie/i), { target: { value: 'Vêtements' } });
        fireEvent.change(screen.getByLabelText(/Prix/i), { target: { value: '20' } });
        fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Une belle description' } });

        fireEvent.click(screen.getByRole('button', { name: "Soumettre l'article" }));

        await waitFor(() => {
            expect(screen.getByText('Le titre doit contenir au moins 5 caractères.')).toBeInTheDocument();
        });

        expect(articlesService.submitArticle).not.toHaveBeenCalled();
    });

    it('should handle submission error', async () => {
        (articlesService.submitArticle as Mock).mockRejectedValue(new Error('Failed'));

        render(<SellForm />);

        fireEvent.change(screen.getByLabelText(/Titre/i), { target: { value: 'Mon Article' } });
        fireEvent.change(screen.getByLabelText(/Catégorie/i), { target: { value: 'Vêtements' } });
        fireEvent.change(screen.getByLabelText(/Prix/i), { target: { value: '20' } });
        fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Une belle description' } });

        fireEvent.click(screen.getByRole('button', { name: "Soumettre l'article" }));

        await waitFor(() => {
            expect(screen.getByText("Échec lors de la soumission de l'article. Veuillez réessayer.")).toBeInTheDocument();
        });
    });
});
