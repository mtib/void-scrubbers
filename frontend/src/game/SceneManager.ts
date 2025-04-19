import * as PIXI from 'pixi.js';
import { Scene } from '../types/Scene';

export class SceneManager {
    private scenes: Map<string, Scene> = new Map();
    private currentScene: Scene | null = null;
    private stage: PIXI.Container;

    constructor(stage: PIXI.Container) {
        this.stage = stage;
    }

    /**
     * Add a scene to the manager
     */
    public addScene(name: string, scene: Scene): void {
        this.scenes.set(name, scene);
    }

    /**
     * Switch to a different scene
     */
    public switchScene(name: string): void {
        // Clean up current scene if it exists
        if (this.currentScene) {
            this.currentScene.destroy();
            this.stage.removeChildren();
        }

        // Get the new scene
        const newScene = this.scenes.get(name);
        if (!newScene) {
            console.error(`Scene "${name}" not found!`);
            return;
        }

        // Initialize and set as current
        this.currentScene = newScene;
        this.currentScene.init(this.stage);
    }

    /**
     * Update the current scene
     */
    public update(delta: number): void {
        if (this.currentScene) {
            this.currentScene.update(delta);
        }
    }

    /**
     * Handle resizing
     */
    public resize(width: number, height: number): void {
        if (this.currentScene) {
            this.currentScene.resize(width, height);
        }
    }
}
