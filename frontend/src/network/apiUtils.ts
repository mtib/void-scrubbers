/**
 * Utility functions for working with API endpoints
 */

function getSchema() {
    // Determine the schema based on the environment
    if (import.meta.env.MODE === 'development') {
        return 'http';
    } else {
        return 'https';
    }
}

/**
 * Get the full API URL for a given endpoint path
 * 
 * @param path The API endpoint path (should start with '/')
 * @returns The complete URL for the API endpoint
 */
export function getApiUrl(path: string): string {
    const apiBase = import.meta.env.VITE_API_HOST;

    if (!apiBase) {
        throw new Error("API base URL is not defined in environment variables.");
    }
    
    // Ensure path starts with a slash
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    return `${getSchema()}://${apiBase}${normalizedPath}`
}

/**
 * Get the base WebSocket URL
 * 
 * @returns The complete URL for the WebSocket endpoint
 */
export function getWsUrl(): string {
    const url = getApiUrl("/ws");
    
    return url.replace(/^http/, 'ws');
}
