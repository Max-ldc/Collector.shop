import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get, post, put, del } from './api';

const { mockAxiosInstance } = vi.hoisted(() => {
    return {
        mockAxiosInstance: {
            get: vi.fn(),
            post: vi.fn(),
            put: vi.fn(),
            delete: vi.fn(),
        },
    };
});

vi.mock('axios', () => {
    return {
        default: {
            create: vi.fn(() => mockAxiosInstance),
        },
    };
});

describe('API Utils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should perform GET request and return data', async () => {
        const mockData = { id: 1, name: 'Test' };
        mockAxiosInstance.get.mockResolvedValue({ data: mockData });

        const result = await get('/test');
        expect(result).toEqual(mockData);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test');
    });

    it('should perform POST request and return data', async () => {
        const mockData = { success: true };
        const payload = { name: 'New' };
        mockAxiosInstance.post.mockResolvedValue({ data: mockData });

        const result = await post('/test', payload);
        expect(result).toEqual(mockData);
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', payload);
    });

    it('should perform PUT request and return data', async () => {
        const mockData = { updated: true };
        const payload = { name: 'Updated' };
        mockAxiosInstance.put.mockResolvedValue({ data: mockData });

        const result = await put('/test/1', payload);
        expect(result).toEqual(mockData);
        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test/1', payload);
    });

    it('should perform DELETE request and return data', async () => {
        const mockData = { deleted: true };
        mockAxiosInstance.delete.mockResolvedValue({ data: mockData });

        const result = await del('/test/1');
        expect(result).toEqual(mockData);
        expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test/1');
    });

    it('should throw simple error on failure with response', async () => {
        const errorMessage = 'Bad Request';
        mockAxiosInstance.get.mockRejectedValue({
            response: { data: { message: errorMessage } }
        });

        await expect(get('/error')).rejects.toThrow(errorMessage);
    });

    it('should throw default error on failure with response but no message', async () => {
        mockAxiosInstance.get.mockRejectedValue({
            response: { data: {} }
        });

        await expect(get('/error')).rejects.toThrow('An error occurred');
    });

    it('should throw network error on failure without response', async () => {
        mockAxiosInstance.get.mockRejectedValue(new Error('Network Error'));

        await expect(get('/network-error')).rejects.toThrow('Network error');
    });
});
