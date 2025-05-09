import * as PIXI from 'pixi.js';

import GlobalGamepadListener from './game/GlobalGamepadListener';
import { SceneManager } from './game/SceneManager';
import PlayerSelectScene from './scenes/PlayerSelectScene';
import { TitleScene } from './scenes/TitleScene';
import { theme } from './utils/theme';
import { apiGet } from './network/apiFetch';
import { Log } from './components/Log';
import GameWorld from './scenes/GameWorld';

class App {
    private app: PIXI.Application;
    private sceneManager: SceneManager;

    constructor() {
        // Create a new PIXI application
        this.app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: theme.colors.background.hex.default,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });

        GlobalGamepadListener.getInstance().init();

        // Create the scene manager
        this.sceneManager = new SceneManager(this.app.stage);
    }

    public start(): void {
        // Append the canvas to the DOM
        document.getElementById('app')?.appendChild(this.app.view as HTMLCanvasElement);

        // Register initial scene
        this.sceneManager.addScene('title', new TitleScene(() => {
            this.sceneManager.switchScene('playerSelect');
        }));
        this.sceneManager.addScene('playerSelect', new PlayerSelectScene(() => {
            this.sceneManager.switchScene('gameWorld');
        }));
        this.sceneManager.addScene('gameWorld', new GameWorld());

        // Start with the title scene
        this.sceneManager.switchScene('title');

        // Start the animation loop
        this.app.ticker.add((delta) => this.update(delta));

        (async () => {
            try {
                const response = await apiGet('/');
                const data = await response.json();
                Log.info(`Successfully pinged API: ${data.message}`);
            } catch (error) {
                Log.error(`Failed to ping API: ${error}`);
            }
        })();
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

export default App;
