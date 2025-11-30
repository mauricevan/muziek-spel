import toPairs from 'lodash/toPairs';
import 'whatwg-fetch';
import { ApiError } from '../utils/errors';

const SPOTIFY_ROOT = 'https://api.spotify.com/v1';

/**
 * Parses the JSON returned by a network request
 *
 * @param  {Response} response A response from a network request
 *
 * @return {Promise<any>}          The parsed JSON from the request
 */
const parseJSON = async (response: Response): Promise<any> => {
  if (response.status === 204 || response.status === 205) {
    return null;
  }
  return response.json();
};

/**
 * Checks if a network request came back fine, and throws an error if not
 *
 * @param  {Response} response   A response from a network request
 *
 * @return {Response} Returns the response if status is OK
 * @throws {ApiError} Throws ApiError if status is not OK
 */
const checkStatus = (response: Response): Response => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const error = new ApiError(
    response.statusText || `HTTP ${response.status}`,
    response.status,
    response.statusText,
    response
  );
  throw error;
};

/**
 * Requests a URL, returning a promise
 *
 * @param  {string} url       The URL we want to request
 * @param  {RequestInit} [options] The options we want to pass to "fetch"
 *
 * @return {Promise<any>}           The response data
 */
/**
 * Retry logic with exponential backoff
 */
const fetchWithRetry = async <T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
  } = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on final attempt or for client errors (4xx)
      if (attempt === maxRetries || (error instanceof ApiError && error.status !== undefined && error.status >= 400 && error.status < 500)) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(2, attempt),
        maxDelay
      );

      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

export const request = async (url: string, options?: RequestInit, retryOptions?: { maxRetries?: number; initialDelay?: number; maxDelay?: number }): Promise<any> => {
  const retryConfig = retryOptions ?? { maxRetries: 3, initialDelay: 1000 };
  return fetchWithRetry(async () => {
    try {
      const response = await fetch(url, options);
      const checkedResponse = checkStatus(response);
      return await parseJSON(checkedResponse);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      // Handle network errors
      if (error instanceof TypeError) {
        throw new ApiError(
          'Network error. Please check your internet connection.',
          undefined,
          undefined,
          undefined
        );
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        undefined,
        undefined,
        undefined
      );
    }
  }, retryConfig);
};

interface FetchFromSpotifyParams {
  token: string;
  endpoint: string;
  params?: Record<string, string | number>;
}

const fetchFromSpotify = async ({ token, endpoint, params }: FetchFromSpotifyParams): Promise<any> => {
  let url = [SPOTIFY_ROOT, endpoint].join('/');
  if (params) {
    const paramString = toPairs(params)
      .map(param => param.join('='))
      .join('&');
    url += `?${paramString}`;
  }
  const options: RequestInit = { headers: { Authorization: `Bearer ${token}` } };
  return request(url, options);
};

export default fetchFromSpotify;

