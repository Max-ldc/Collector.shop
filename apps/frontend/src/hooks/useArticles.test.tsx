import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useArticles from './useArticles';
import { fetchValidatedArticles } from '../services/articles.service';

vi.mock('../services/articles.service');

describe('useArticles Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches articles initially', async () => {
        (fetchValidatedArticles as any).mockResolvedValue([
            { id: '1', title: 'Test', status: 'validated' }
        ]);

        const { result } = renderHook(() => useArticles());

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.articles).toHaveLength(1);
        expect(result.current.error).toBeNull();
    });

    it('handles fetch errors', async () => {
        (fetchValidatedArticles as any).mockRejectedValue(new Error('Network Error'));

        const { result } = renderHook(() => useArticles());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe('Failed to fetch articles');
        expect(result.current.articles).toHaveLength(0);
    });
});
