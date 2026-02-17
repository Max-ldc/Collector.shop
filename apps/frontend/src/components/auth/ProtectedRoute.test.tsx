import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import useAuth from '../../hooks/useAuth';

// Mock useAuth hook
vi.mock('../../hooks/useAuth');

describe('ProtectedRoute', () => {
    it('shows loading state when not initialized', () => {
        vi.mocked(useAuth).mockReturnValue({
            isAuthenticated: false,
            initialized: false,
            userRoles: []
        });

        render(
            <MemoryRouter>
                <ProtectedRoute />
            </MemoryRouter>
        );

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('redirects to login if not authenticated', () => {
        vi.mocked(useAuth).mockReturnValue({
            isAuthenticated: false,
            initialized: true,
            userRoles: []
        });

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route path="/protected" element={<ProtectedRoute />} />
                    <Route path="/login" element={<div>Login Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('redirects to home if role is missing', () => {
        vi.mocked(useAuth).mockReturnValue({
            isAuthenticated: true,
            initialized: true,
            userRoles: ['user']
        });

        render(
            <MemoryRouter initialEntries={['/admin']}>
                <Routes>
                    <Route path="/admin" element={<ProtectedRoute roles={['admin']} />} />
                    <Route path="/" element={<div>Home Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    it('renders children if authenticated and authorized', () => {
        vi.mocked(useAuth).mockReturnValue({
            isAuthenticated: true,
            initialized: true,
            userRoles: ['admin']
        });

        render(
            <MemoryRouter initialEntries={['/admin']}>
                <Routes>
                    <Route path="/admin" element={
                        <ProtectedRoute roles={['admin']}>
                            <div>Admin Content</div>
                        </ProtectedRoute>
                    } />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });
});
