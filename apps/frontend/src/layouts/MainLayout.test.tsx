import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MainLayout from './MainLayout';

vi.mock('../components/Navbar', () => ({ default: () => <div data-testid="navbar">Navbar</div> }));
vi.mock('../components/Footer', () => ({ default: () => <div data-testid="footer">Footer</div> }));
vi.mock('react-router-dom', () => ({ Outlet: () => <div data-testid="outlet">Outlet</div> }));

describe('MainLayout', () => {
    it('renders layout structure', () => {
        render(<MainLayout />);
        expect(screen.getByTestId('navbar')).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
        expect(screen.getByTestId('outlet')).toBeInTheDocument();
    });
});
