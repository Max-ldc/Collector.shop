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

        expect(screen.getByText('Admin Panel')).toBeInTheDocument();
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Articles')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Dashboard/i })).toHaveAttribute('href', '/admin');
    });
});
