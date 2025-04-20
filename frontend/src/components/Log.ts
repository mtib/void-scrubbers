import * as PIXI from 'pixi.js';
import { theme } from '../utils/theme';

/**
 * Types of log messages with corresponding colors
 */
export enum LogType {
    INFO = 'info',
    SUCCESS = 'success',
    WARNING = 'warning',
    ERROR = 'error',
    SYSTEM = 'system',
    COMBAT = 'combat',
    LOOT = 'loot',
}

/**
 * Configuration for different log message types
 */
const LOG_TYPE_CONFIG: Record<LogType, { color: number; icon?: string; }> = {
    [LogType.INFO]: { color: theme.colors.text.hex.primary },
    [LogType.SUCCESS]: { color: 0x4CAF50 }, // Green
    [LogType.WARNING]: { color: 0xFF9800 }, // Orange
    [LogType.ERROR]: { color: 0xF44336 }, // Red
    [LogType.SYSTEM]: { color: theme.colors.primary.hex.light },
    [LogType.COMBAT]: { color: 0xFF5722 }, // Deep Orange
    [LogType.LOOT]: { color: 0xFFEB3B }, // Yellow
};

/**
 * A single log message with metadata
 */
export interface LogMessage {
    type: LogType;
    text: string;
    timestamp: number;
    id: string;
}

/**
 * Log configuration options
 */
export interface LogOptions {
    maxMessages?: number;
    width?: number;
    height?: number;
    padding?: number;
    lineHeight?: number;
    background?: {
        color: number;
        alpha: number;
    };
    fadeTime?: number;
}

/**
 * Default log options
 */
const DEFAULT_OPTIONS: LogOptions = {
    maxMessages: 100,
    width: 400,
    height: 200,
    padding: 10,
    lineHeight: 20,
    background: {
        color: theme.colors.background.hex.paper,
        alpha: 0.1,
    },
    fadeTime: 5000, // Time in ms before messages start to fade
};

/**
 * A reusable log component that can display messages of different types
 */
export class Log {
    private container: PIXI.Container;
    private background: PIXI.Graphics;
    private messagesContainer: PIXI.Container;
    private maskGraphics: PIXI.Graphics;
    private messages: LogMessage[] = [];
    private messageElements: Map<string, PIXI.Container> = new Map();
    private options: LogOptions;
    private visibleMessageCount: number = 0;
    private scrollPosition: number = 0;
    private time: number = 0;

    private static instance: Log | null = null;

    /**
     * Get the global log instance
     */
    public static getInstance(options?: LogOptions): Log {
        if (!Log.instance) {
            Log.instance = new Log(options);
        }
        return Log.instance;
    }

    /**
     * Add a message to the global log
     */
    public static addMessage(text: string, type: LogType = LogType.INFO): void {
        Log.getInstance().addMessage(text, type);
    }

    /**
     * Add an info message to the global log
     */
    public static info(text: string): void {
        Log.addMessage(text, LogType.INFO);
    }

    /**
     * Add a success message to the global log
     */
    public static success(text: string): void {
        Log.addMessage(text, LogType.SUCCESS);
    }

    /**
     * Add a warning message to the global log
     */
    public static warning(text: string): void {
        Log.addMessage(text, LogType.WARNING);
    }

    /**
     * Add an error message to the global log
     */
    public static error(text: string): void {
        Log.addMessage(text, LogType.ERROR);
    }

    /**
     * Add a system message to the global log
     */
    public static system(text: string): void {
        Log.addMessage(text, LogType.SYSTEM);
    }

    /**
     * Add a combat message to the global log
     */
    public static combat(text: string): void {
        Log.addMessage(text, LogType.COMBAT);
    }

    /**
     * Add a loot message to the global log
     */
    public static loot(text: string): void {
        Log.addMessage(text, LogType.LOOT);
    }

    /**
     * Clear all messages from the global log
     */
    public static clear(): void {
        Log.getInstance().clear();
    }

    /**
     * Create a new log component
     */
    constructor(options?: LogOptions) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
        this.container = new PIXI.Container();

        // Create the background
        this.background = new PIXI.Graphics();
        this.updateBackground();
        this.container.addChild(this.background);

        // Create messages container with mask for scrolling
        this.messagesContainer = new PIXI.Container();
        this.container.addChild(this.messagesContainer);

        // Create mask for scrolling
        this.maskGraphics = new PIXI.Graphics();
        this.updateMask();
        this.container.addChild(this.maskGraphics);
        this.messagesContainer.mask = this.maskGraphics;

        // Set up scrolling with mouse wheel
        this.container.eventMode = 'static';
        this.container.on('wheel', this.onWheel.bind(this));
    }

    /**
     * Add a message to the log
     */
    public addMessage(text: string, type: LogType = LogType.INFO): void {
        const timestamp = Date.now();
        const id = `log-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;

        const message: LogMessage = {
            type,
            text,
            timestamp,
            id,
        };

        // Add to message array
        this.messages.unshift(message);

        // Trim the array if it exceeds the maximum size
        if (this.messages.length > (this.options.maxMessages || DEFAULT_OPTIONS.maxMessages!)) {
            const removed = this.messages.pop();
            if (removed && this.messageElements.has(removed.id)) {
                const element = this.messageElements.get(removed.id);
                if (element) {
                    element.destroy();
                    this.messageElements.delete(removed.id);
                }
            }
        }

        // Create and add the visual element
        const messageElement = this.createMessageElement(message);
        this.messagesContainer.addChild(messageElement);
        this.messageElements.set(message.id, messageElement);

        // Update the layout
        this.updateLayout();
    }

    /**
     * Clear all messages
     */
    public clear(): void {
        this.messages = [];
        this.messagesContainer.removeChildren();
        this.messageElements.clear();
        this.updateLayout();
    }

    /**
     * Update the log (call this in your scene's update loop)
     */
    public update(delta: number): void {
        this.time += delta;

        // Update message alpha based on age
        const now = Date.now();
        for (const message of this.messages) {
            const element = this.messageElements.get(message.id);
            if (element) {
                const age = now - message.timestamp;

                // Start fading after fadeTime
                if (age > this.options.fadeTime!) {
                    const fadeProgress = Math.min(1, (age - this.options.fadeTime!) / 3000);
                    element.alpha = 1 - fadeProgress;
                } else {
                    element.alpha = 1;
                }
            }
        }
    }

    /**
     * Resize the log component
     */
    public resize(width: number, height: number): void {
        this.options.width = width;
        this.options.height = height;

        this.updateBackground();
        this.updateMask();
        this.updateLayout();
    }

    /**
     * Get the PIXI container for this component
     */
    public getContainer(): PIXI.Container {
        return this.container;
    }

    /**
     * Position the log on the screen
     */
    public setPosition(x: number, y: number): void {
        this.container.position.set(x, y);
    }

    /**
     * Set the visibility of the log
     */
    public setVisible(visible: boolean): void {
        this.container.visible = visible;
    }

    /**
     * Toggle the visibility of the log
     */
    public toggleVisibility(): void {
        this.container.visible = !this.container.visible;
    }

    /**
     * Create a visual element for a log message
     */
    private createMessageElement(message: LogMessage): PIXI.Container {
        const container = new PIXI.Container();

        // Get the color for this message type
        const config = LOG_TYPE_CONFIG[message.type];

        // Create the text element
        const textStyle = new PIXI.TextStyle({
            ...theme.textStyles.body,
            fill: config.color,
            fontSize: 14,
            wordWrap: true,
            wordWrapWidth: (this.options.width || DEFAULT_OPTIONS.width!) - (this.options.padding || DEFAULT_OPTIONS.padding!) * 2,
        });

        // Format the message with timestamp
        const time = new Date(message.timestamp);
        const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
        const formattedText = `[${timeStr}] ${message.text}`;

        const text = new PIXI.Text(formattedText, textStyle);
        text.position.set(0, 0);
        container.addChild(text);

        return container;
    }

    /**
     * Update the background graphics
     */
    private updateBackground(): void {
        const width = this.options.width || DEFAULT_OPTIONS.width!;
        const height = this.options.height || DEFAULT_OPTIONS.height!;
        const bgConfig = this.options.background || DEFAULT_OPTIONS.background!;

        this.background.clear();
        this.background.beginFill(bgConfig.color, bgConfig.alpha);
        this.background.drawRoundedRect(0, 0, width, height, 8);
        this.background.endFill();
    }

    /**
     * Update the mask for scrolling
     */
    private updateMask(): void {
        const width = this.options.width || DEFAULT_OPTIONS.width!;
        const height = this.options.height || DEFAULT_OPTIONS.height!;
        const padding = this.options.padding || DEFAULT_OPTIONS.padding!;

        this.maskGraphics.clear();
        this.maskGraphics.beginFill(0xFFFFFF);
        this.maskGraphics.drawRect(padding, padding, width - padding * 2, height - padding * 2);
        this.maskGraphics.endFill();
    }

    /**
     * Update the layout of all message elements
     */
    private updateLayout(): void {
        const padding = this.options.padding || DEFAULT_OPTIONS.padding!;

        // Reset the messages container position
        this.messagesContainer.position.set(padding, padding);

        // Position each message element
        let currentY = 0;
        this.visibleMessageCount = 0;

        for (let i = 0; i < this.messages.length; i++) {
            const message = this.messages[i];
            const element = this.messageElements.get(message.id);

            if (element) {
                element.position.y = currentY - this.scrollPosition;
                currentY += element.height + 4; // 4px spacing between messages
                this.visibleMessageCount++;
            }
        }
    }

    /**
     * Handle mouse wheel events for scrolling
     */
    private onWheel(event: WheelEvent): void {
        const scrollFactor = 0.2;
        const scrollDelta = event.deltaY * scrollFactor;

        const contentHeight = this.calculateContentHeight();
        const viewHeight = (this.options.height || DEFAULT_OPTIONS.height!) - (this.options.padding || DEFAULT_OPTIONS.padding!) * 2;

        // Only allow scrolling if content height exceeds view height
        if (contentHeight > viewHeight) {
            this.scrollPosition = Math.max(0, Math.min(contentHeight - viewHeight, this.scrollPosition + scrollDelta));
            this.updateLayout();
        }

        // Prevent the page from scrolling
        event.preventDefault();
    }

    /**
     * Calculate the total height of all message elements
     */
    private calculateContentHeight(): number {
        let totalHeight = 0;

        for (const element of this.messageElements.values()) {
            totalHeight += element.height + 4; // 4px spacing
        }

        return totalHeight;
    }
}
