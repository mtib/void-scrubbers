import * as PIXI from 'pixi.js';
import { Scene } from '../types/Scene';
import { theme } from '../utils/theme';
import { Log } from '../components/Log';
import GlobalPlayerManager from '@/store/GlobalPlayerManager';
import Button from '@/components/Button';

export class TitleScene implements Scene {
    private container: PIXI.Container;
    private title: PIXI.Text;
    private startButton: Button;
    private backgroundGraphics: PIXI.Graphics;
    private log: Log;

    private time: number = 0;

    constructor(public onStartClick: () => void) {
        this.container = new PIXI.Container();

        // Add a background with a subtle gradient
        this.backgroundGraphics = new PIXI.Graphics();
        this.container.addChild(this.backgroundGraphics);

        // Create title text
        this.title = new PIXI.Text('Void Scrubbers', theme.textStyles.title);
        this.title.anchor.set(0.5);

        // Create start button
        this.startButton = new Button('Start Game', this.onStartClick.bind(this), {
            width: 200,
            height: 50,
        });

        // Create log component
        this.log = Log.getInstance();

        // Add to container
        this.log.add(this.container);
        this.startButton.add(this.container);
        this.container.addChild(this.title);
    }

    public init(parent: PIXI.Container): void {
        parent.addChild(this.container);

        // Initial resize to position elements
        this.resize(window.innerWidth, window.innerHeight);

        // All players are in the menu mode
        GlobalPlayerManager.getInstance().setMenuMode(null, true);

        // Add some sample log messages
        Log.system("Welcome to Void Scrubbers!");
    }

    public update(delta: number): void {
        this.time += delta;
        // Add a subtle pulsing effect to the title
        this.title.scale.x = 1 + Math.sin(this.time / 100) * 0.05;
        this.title.scale.y = 1 + Math.sin(this.time / 100) * 0.05;

        this.title.rotation = Math.sin(this.time / 50) * 0.01;

        // Update the log
        this.log.update(delta);
    }

    public resize(width: number, height: number): void {
        // Update background
        this.backgroundGraphics.clear();
        this.backgroundGraphics.beginFill(theme.colors.background.hex.default);
        this.backgroundGraphics.drawRect(0, 0, width, height);
        this.backgroundGraphics.endFill();

        // Add subtle radial gradient
        const gradientTexture = theme.createGradientTexture(theme.colors.primary.dark, theme.colors.background.default);
        const sprite = new PIXI.Sprite(gradientTexture);
        sprite.width = width;
        sprite.height = height;
        sprite.blendMode = PIXI.BLEND_MODES.SCREEN;
        sprite.alpha = 0.2;

        // Remove old gradient if exists
        if (this.backgroundGraphics.children.length > 0) {
            this.backgroundGraphics.removeChildren();
        }
        this.backgroundGraphics.addChild(sprite);

        // Center title
        this.title.x = width / 2;
        this.title.y = height / 3;

        // Center start button
        this.startButton.position = { x: (width - 200) / 2, y: height / 2 };

        // Position log at bottom left
        this.log.position = { x: 20, y: height - 220 };
    }

    public destroy(): void {
        // Clean up event listeners
        this.startButton.remove();

        // Remove from parent
        if (this.container.parent) {
            this.container.parent.removeChild(this.container);
        }

        // Clean up children
        this.container.removeChildren();
        this.log.remove();
    }
}
