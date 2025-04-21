/**
 * Simple API client for communicating with the backend
 */
export class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = '/api') {
        this.baseUrl = baseUrl;
    }

    /**
     * Perform a GET request
     */
    public async get<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`);

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        return response.json() as Promise<T>;
    }

    /**
     * Perform a POST request
     */
    public async post<T>(endpoint: string, data: unknown): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        return response.json() as Promise<T>;
    }

    /**
     * Check if the API is available
     */
    public async healthCheck(): Promise<boolean> {
        try {
            const response = await this.get<{ status: string; }>('/health');
            return response.status === 'ok';
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    }
}
