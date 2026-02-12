import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';
import { describe, it, expect } from 'vitest';

describe('Footer', () => {
    it('should render copyright text', () => {
        render(<Footer />);
        expect(screen.getByText(/Collector Shop/i)).toBeInTheDocument();
        expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
    });
});
