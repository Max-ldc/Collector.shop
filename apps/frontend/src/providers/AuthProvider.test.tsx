import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuthContext } from './AuthProvider';
import keycloakInstance from '../keycloak';
import { check } from 'prettier';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';

// Mock Keycloak instance
vi.mock('../keycloak', () => {
    return {
        default: {
            init: vi.fn(),
            login: vi.fn(),
            logout: vi.fn(),
            token: 'mock-token',
            tokenParsed: {
                realm_access: {
                    roles: ['user', 'admin']
                }
            }
        }
    };
});

const TestComponent = () => {
    const { isAuthenticated, initialized, userRoles, login, logout } = useAuthContext();
    return (
        <div>
            <div data-testid="initialized">{initialized.toString()}</div>
            <div data-testid="authenticated">{isAuthenticated.toString()}</div>
            <div data-testid="roles">{userRoles.join(',')}</div>
            <button onClick={login}>Login</button>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

describe('AuthProvider', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize keycloak and update state on success', async () => {
        (keycloakInstance.init as Mock).mockResolvedValue(true);

        await act(async () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );
        });

        await waitFor(() => {
            expect(screen.getByTestId('initialized').textContent).toBe('true');
            expect(screen.getByTestId('authenticated').textContent).toBe('true');
            expect(screen.getByTestId('roles').textContent).toBe('user,admin');
        });
    });

    it('should handle initialization failure', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        (keycloakInstance.init as Mock).mockRejectedValue(new Error('Init failed'));

        await act(async () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );
        });

        await waitFor(() => {
            // Should still set initialized to true to prevent infinite loading
            expect(screen.getByTestId('initialized').textContent).toBe('true');
            expect(screen.getByTestId('authenticated').textContent).toBe('false');
        });

        expect(consoleSpy).toHaveBeenCalledWith('Failed to initialize Keycloak', expect.any(Error));
        consoleSpy.mockRestore();
    });

    it('should call login method', async () => {
        (keycloakInstance.init as Mock).mockResolvedValue(false);

        await act(async () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );
        });

        await waitFor(() => expect(screen.getByTestId('initialized').textContent).toBe('true'));

        const loginButton = screen.getByText('Login');
        act(() => {
            loginButton.click();
        });

        expect(keycloakInstance.login).toHaveBeenCalled();
    });

    it('should call logout method', async () => {
        (keycloakInstance.init as Mock).mockResolvedValue(true);

        await act(async () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );
        });

        await waitFor(() => expect(screen.getByTestId('initialized').textContent).toBe('true'));

        const logoutButton = screen.getByText('Logout');
        act(() => {
            logoutButton.click();
        });

        expect(keycloakInstance.logout).toHaveBeenCalledWith({
            redirectUri: window.location.origin,
        });
    });

    it('should throw error if useAuthContext is used outside AuthProvider', () => {
        // Suppress console.error for this test as React logs the error boundary
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        expect(() => render(<TestComponent />)).toThrow('useAuthContext must be used within an AuthProvider');

        consoleSpy.mockRestore();
    });
});
