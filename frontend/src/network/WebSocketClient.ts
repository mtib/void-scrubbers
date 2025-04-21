import { Log } from '@/components/Log';
import { getWsUrl } from './apiUtils';

/**
 * WebSocket client for real-time communication with the backend
 */
export class WebSocketClient {
    private socket: WebSocket | null = null;
    private url: string;
    private reconnectInterval: number;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number;
    private messageHandlers: Map<string, ((data: unknown) => void)[]> = new Map();

    constructor(
        reconnectInterval: number = 3000,
        maxReconnectAttempts: number = 5
    ) {
        this.url = getWsUrl();
        this.reconnectInterval = reconnectInterval;
        this.maxReconnectAttempts = maxReconnectAttempts;
    }

    /**
     * Connect to the WebSocket server
     */
    public connect(): void {
        if (this.socket) {
            return;
        }

        try {
            this.socket = new WebSocket(this.url);

            this.socket.onopen = () => {
                Log.info('WebSocket connected');
                this.reconnectAttempts = 0;
            };

            this.socket.onclose = (event) => {
                Log.info(`WebSocket closed: ${event.code} ${event.reason}`);
                this.socket = null;

                // Attempt to reconnect
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    setTimeout(() => this.connect(), this.reconnectInterval);
                }
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            this.socket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data as unknown as string) as unknown as { type: string; data: unknown };
                    const { type, data } = message;

                    // Dispatch to message handlers
                    if (this.messageHandlers.has(type)) {
                        const handlers = this.messageHandlers.get(type) || [];
                        handlers.forEach(handler => handler(data));
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
        } catch (error) {
            console.error('Error connecting to WebSocket:', error);
        }
    }

    /**
     * Send a message to the server
     */
    public send(type: string, data: unknown): boolean {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error('WebSocket is not connected');
            return false;
        }

        try {
            const message = JSON.stringify({ type, data });
            this.socket.send(message);
            return true;
        } catch (error) {
            console.error('Error sending WebSocket message:', error);
            return false;
        }
    }

    /**
     * Register a handler for a specific message type
     */
    public on(type: string, handler: (data: unknown) => void): void {
        if (!this.messageHandlers.has(type)) {
            this.messageHandlers.set(type, []);
        }

        const handlers = this.messageHandlers.get(type) || [];
        handlers.push(handler);
    }

    /**
     * Remove a handler for a specific message type
     */
    public off(type: string, handler?: (data: unknown) => void): void {
        if (!handler) {
            // Remove all handlers for this type
            this.messageHandlers.delete(type);
            return;
        }

        if (this.messageHandlers.has(type)) {
            const handlers = this.messageHandlers.get(type) || [];
            const index = handlers.indexOf(handler);

            if (index !== -1) {
                handlers.splice(index, 1);
            }

            if (handlers.length === 0) {
                this.messageHandlers.delete(type);
            }
        }
    }

    /**
     * Disconnect from the WebSocket server
     */
    public disconnect(): void {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}
