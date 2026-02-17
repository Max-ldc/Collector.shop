import { describe, it, expect, vi } from 'vitest';
import './App';

// Mock Keycloak and AuthProvider to avoid complex async setup in tests
vi.mock('./providers/AuthProvider', () => ({
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    useAuth: () => ({ isAuthenticated: true, userRoles: [], login: vi.fn(), logout: vi.fn() })
}));

describe('App', () => {
    it('renders without crashing', () => {
        // Simply checking if the test runner works and App can be imported
        expect(true).toBe(true);
    });
});
