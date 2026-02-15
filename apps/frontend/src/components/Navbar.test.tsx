import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../hooks/useAuth';
import { describe, it, expect, vi, Mock } from 'vitest';

vi.mock('../hooks/useAuth');

describe('Navbar', () => {
    it('should render login button when not authenticated', () => {
        (useAuth as Mock).mockReturnValue({
            isAuthenticated: false,
            userRoles: [],
            login: vi.fn(),
            logout: vi.fn(),
        });

        render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );

        expect(screen.getByText('Se connecter')).toBeInTheDocument();
        expect(screen.queryByText('Se déconnecter')).not.toBeInTheDocument();
        expect(screen.queryByText('Vendre')).not.toBeInTheDocument();
        expect(screen.queryByText('Administration')).not.toBeInTheDocument();
    });

    it('should render logout button and sell link when authenticated', () => {
        (useAuth as Mock).mockReturnValue({
            isAuthenticated: true,
            userRoles: [],
            login: vi.fn(),
            logout: vi.fn(),
        });

        render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );

        expect(screen.getByText('Se déconnecter')).toBeInTheDocument();
        expect(screen.getByText('Vendre')).toBeInTheDocument();
        expect(screen.queryByText('Administration')).not.toBeInTheDocument();
    });

    it('should render admin link when user has admin role', () => {
        (useAuth as Mock).mockReturnValue({
            isAuthenticated: true,
            userRoles: ['ROLE_ADMIN'],
            login: vi.fn(),
            logout: vi.fn(),
        });

        render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );

        expect(screen.getByText('Administration')).toBeInTheDocument();
    });

    it('should call login/logout actions', () => {
        const loginMock = vi.fn();
        const logoutMock = vi.fn();

        (useAuth as Mock).mockReturnValue({
            isAuthenticated: false,
            userRoles: [],
            login: loginMock,
            logout: logoutMock,
        });

        const { rerender } = render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );

        fireEvent.click(screen.getByText('Se connecter'));
        expect(loginMock).toHaveBeenCalled();

        (useAuth as Mock).mockReturnValue({
            isAuthenticated: true,
            userRoles: [],
            login: loginMock,
            logout: logoutMock,
        });

        rerender(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );

        fireEvent.click(screen.getByText('Se déconnecter'));
        expect(logoutMock).toHaveBeenCalled();
    });
});
