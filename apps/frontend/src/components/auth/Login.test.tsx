import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from './Login';
import useAuth from '../../hooks/useAuth';

vi.mock('../../hooks/useAuth');

describe('Login Component', () => {
    it('renders login button', () => {
        const loginMock = vi.fn();
        (useAuth as any).mockReturnValue({ login: loginMock });

        render(<Login />);
        expect(screen.getByText('Login with Keycloak')).toBeInTheDocument();
    });

    it('calls login on click', () => {
        const loginMock = vi.fn();
        (useAuth as any).mockReturnValue({ login: loginMock });

        render(<Login />);
        fireEvent.click(screen.getByText('Login with Keycloak'));
        expect(loginMock).toHaveBeenCalled();
    });
});
