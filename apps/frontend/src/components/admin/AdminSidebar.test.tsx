import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { describe, it, expect } from 'vitest';

describe('AdminSidebar', () => {
    it('should render sidebar links', () => {
        render(
            <BrowserRouter>
                <AdminSidebar />
            </BrowserRouter>
        );

        expect(screen.getByText("Panneau d'administration")).toBeInTheDocument();
        expect(screen.getByText('Tableau de bord')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Tableau de bord/i })).toHaveAttribute('href', '/admin');
    });
});
