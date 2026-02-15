import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { describe, it, expect } from 'vitest';

describe('AdminLayout', () => {
    it('should render sidebar and outlet content', () => {
        render(
            <MemoryRouter initialEntries={['/admin/test']}>
                <Routes>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route path="test" element={<div>Child Content</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText("Panneau d'administration")).toBeInTheDocument(); // Sidebar
        expect(screen.getByText('Child Content')).toBeInTheDocument(); // Outlet
    });
});
