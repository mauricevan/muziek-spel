import { describe, it, expect, vi, beforeEach } from 'vitest';
import { request } from './api';
import { ApiError } from '../utils/errors';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

// Mock console.log to avoid retry messages in tests
vi.spyOn(console, 'log').mockImplementation(() => {});

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('request', () => {
    it('should return parsed JSON for successful requests', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        json: vi.fn().mockResolvedValue(mockData),
      } as unknown as Response;

      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await request('https://api.example.com/data');
      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/data', undefined);
    });

    it('should return null for 204 status', async () => {
      const mockResponse = {
        status: 204,
        statusText: 'No Content',
        json: vi.fn().mockResolvedValue({}),
      } as unknown as Response;

      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await request('https://api.example.com/data');
      expect(result).toBeNull();
    });

    it('should throw ApiError for non-2xx status codes', async () => {
      const mockResponse = {
        status: 404,
        statusText: 'Not Found',
        json: vi.fn().mockResolvedValue({}),
      } as unknown as Response;

      mockFetch.mockResolvedValueOnce(mockResponse);

      await expect(
        request('https://api.example.com/data', undefined, { maxRetries: 0 })
      ).rejects.toThrow();
      
      try {
        await request('https://api.example.com/data', undefined, { maxRetries: 0 });
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        if (error instanceof ApiError) {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        }
      }
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Network error'));

      await expect(
        request('https://api.example.com/data', undefined, { maxRetries: 0 })
      ).rejects.toThrow();
      
      try {
        await request('https://api.example.com/data', undefined, { maxRetries: 0 });
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        if (error instanceof ApiError) {
          expect(error.message).toContain('Network error');
        }
      }
    });
  });

  describe('ApiError', () => {
    it('should create error with status and statusText', () => {
      const error = new ApiError('Test error', 404, 'Not Found');
      expect(error.message).toBe('Test error');
      expect(error.status).toBe(404);
      expect(error.statusText).toBe('Not Found');
      expect(error.name).toBe('ApiError');
    });
  });
});

