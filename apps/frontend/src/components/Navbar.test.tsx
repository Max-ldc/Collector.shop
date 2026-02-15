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
    });

    it('should rendering navigation links when authenticated', () => {
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

        const homeLink = screen.getByText('Accueil');
        const sellLink = screen.getByText('Vendre');

        // Test hover effects
        fireEvent.mouseEnter(homeLink);
        expect(homeLink.style.color).toBe('rgb(44, 62, 80)'); // #2c3e50

        fireEvent.mouseLeave(homeLink);
        expect(homeLink.style.color).toBe('rgb(85, 85, 85)'); // #555

        fireEvent.mouseEnter(sellLink);
        expect(sellLink.style.color).toBe('rgb(44, 62, 80)');

        fireEvent.mouseLeave(sellLink);
        expect(sellLink.style.color).toBe('rgb(85, 85, 85)');
    });

    it('should render admin link with hover effects when admin', () => {
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

        const adminLink = screen.getByText('Administration');
        
        // Initial color #e67e22 -> rgb(230, 126, 34)
        expect(adminLink.style.color).toBe('rgb(230, 126, 34)');

        // Hover #d35400 -> rgb(211, 84, 0)
        fireEvent.mouseEnter(adminLink);
        expect(adminLink.style.color).toBe('rgb(211, 84, 0)');

        // Leave #e67e22
        fireEvent.mouseLeave(adminLink);
        expect(adminLink.style.color).toBe('rgb(230, 126, 34)');
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
