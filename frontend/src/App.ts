import * as PIXI from 'pixi.js';
import { SceneManager } from './game/SceneManager';
import { TitleScene } from './scenes/TitleScene';

export class App {
    private app: PIXI.Application;
    private sceneManager: SceneManager;

    constructor() {
        // Create a new PIXI application
        this.app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x000000,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });

        // Create the scene manager
        this.sceneManager = new SceneManager(this.app.stage);
    }

    public start(): void {
        // Append the canvas to the DOM
        document.getElementById('app')?.appendChild(this.app.view as HTMLCanvasElement);

        // Register initial scene
        this.sceneManager.addScene('title', new TitleScene());

        // Start with the title scene
        this.sceneManager.switchScene('title');

        // Start the animation loop
        this.app.ticker.add((delta) => this.update(delta));
    }

    private update(delta: number): void {
        // Update the current scene
        this.sceneManager.update(delta);
    }

    public resize(): void {
        // Resize the renderer
        this.app.renderer.resize(window.innerWidth, window.innerHeight);

        // Notify the scene manager about resize
        this.sceneManager.resize(window.innerWidth, window.innerHeight);
    }
}
