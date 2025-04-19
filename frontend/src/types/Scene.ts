import * as PIXI from 'pixi.js';

export interface Scene {
    /**
     * Initialize the scene
     */
    init(parent: PIXI.Container): void;

    /**
     * Update the scene on each frame
     */
    update(delta: number): void;

    /**
     * Handle window resize
     */
    resize(width: number, height: number): void;

    /**
     * Clean up resources when scene is destroyed
     */
    destroy(): void;
}
