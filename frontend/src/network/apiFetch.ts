/**
 * Create a fetch wrapper that handles API requests with proper URL configuration
 * and common error handling
 */

import { getApiUrl } from './apiUtils';

/**
 * Enhanced fetch function for API requests that uses the configured API base URL
 * 
 * @param endpoint The API endpoint path (should start with '/')
 * @param options Fetch options
 * @returns Promise with the fetch response
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = getApiUrl(endpoint);
  
  // Set default headers if none provided
  if (!options.headers) {
    options.headers = {
      'Content-Type': 'application/json',
    };
  }
  
  try {
    return fetch(url, options);
  } catch (error) {
    // Log and rethrow errors
    console.error(`API request to ${endpoint} failed:`, error);
    throw error;
  }
}

/**
 * GET request helper
 */
export function apiGet(endpoint: string, options: RequestInit = {}): Promise<Response> {
  return apiFetch(endpoint, {
    method: 'GET',
    ...options,
  });
}

/**
 * POST request helper with JSON body
 */
export function apiPost(endpoint: string, data: unknown, options: RequestInit = {}): Promise<Response> {
  return apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * PUT request helper with JSON body
 */
export function apiPut(endpoint: string, data: unknown, options: RequestInit = {}): Promise<Response> {
  return apiFetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * DELETE request helper
 */
export function apiDelete(endpoint: string, options: RequestInit = {}): Promise<Response> {
  return apiFetch(endpoint, {
    method: 'DELETE',
    ...options,
  });
}
