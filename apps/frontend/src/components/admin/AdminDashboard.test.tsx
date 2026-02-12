import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import { describe, it, expect } from 'vitest';

describe('AdminDashboard', () => {
    it('should render the dashboard links', () => {
        render(
            <BrowserRouter>
                <AdminDashboard />
            </BrowserRouter>
        );

        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Manage Articles')).toBeInTheDocument();
        expect(screen.getByText('Manage Users')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Manage Articles/i })).toHaveAttribute('href', '/admin/articles');
    });
});
