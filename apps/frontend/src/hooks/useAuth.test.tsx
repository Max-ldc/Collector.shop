import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import useAuth from './useAuth';
import { useAuthContext } from '../providers/AuthProvider';

// Mock the context hook
vi.mock('../providers/AuthProvider', async () => {
    const actual = await vi.importActual('../providers/AuthProvider');
    return {
        ...actual,
        useAuthContext: vi.fn(),
    };
});

describe('useAuth Hook', () => {
    it('returns authentication status', () => {
        const mockContext = {
            isAuthenticated: true,
            userRoles: ['user'],
            initialized: true,
            login: vi.fn(),
            logout: vi.fn(),
        };
        (useAuthContext as ReturnType<typeof vi.fn>).mockReturnValue(mockContext);

        const { result } = renderHook(() => useAuth());

        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.userRoles).toEqual(['user']);
    });

    it('checks for specific roles correctly', () => {
        const mockContext = {
            isAuthenticated: true,
            userRoles: ['admin', 'editor'],
            initialized: true,
            login: vi.fn(),
            logout: vi.fn(),
        };
        (useAuthContext as ReturnType<typeof vi.fn>).mockReturnValue(mockContext);

        const { result } = renderHook(() => useAuth());

        expect(result.current.hasRole('admin')).toBe(true);
        expect(result.current.hasRole('user')).toBe(false);
    });
});
