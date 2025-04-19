import * as PIXI from 'pixi.js';
import { Scene } from '../types/Scene';

export class TitleScene implements Scene {
    private container: PIXI.Container;
    private title: PIXI.Text;
    private startButton: PIXI.Container;
    private startText: PIXI.Text;

    constructor() {
        this.container = new PIXI.Container();

        // Create title text
        this.title = new PIXI.Text('Void Scrubbers', {
            fontFamily: 'Arial',
            fontSize: 64,
            fill: 0xffffff,
            align: 'center',
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowBlur: 4,
            dropShadowDistance: 6
        });
        this.title.anchor.set(0.5);

        // Create start button
        this.startButton = new PIXI.Container();

        const buttonBackground = new PIXI.Graphics();
        buttonBackground.beginFill(0x3355ff);
        buttonBackground.drawRoundedRect(0, 0, 200, 50, 10);
        buttonBackground.endFill();

        this.startText = new PIXI.Text('Start Game', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffffff
        });
        this.startText.anchor.set(0.5);
        this.startText.x = 100;
        this.startText.y = 25;

        this.startButton.addChild(buttonBackground);
        this.startButton.addChild(this.startText);
        this.startButton.x = -100; // Will be centered by resize
        this.startButton.y = 100;
        this.startButton.eventMode = 'static';
        this.startButton.cursor = 'pointer';
        this.startButton.on('pointerdown', this.onStartClick.bind(this));

        // Add to container
        this.container.addChild(this.title);
        this.container.addChild(this.startButton);

    }

    public init(parent: PIXI.Container): void {
        parent.addChild(this.container);

        // Initial resize to position elements
        this.resize(window.innerWidth, window.innerHeight);
    }

    public update(delta: number): void {
        delta;
        // Add any animations or updates here
    }

    public resize(width: number, height: number): void {
        // Center title
        this.title.x = width / 2;
        this.title.y = height / 3;

        // Center start button
        this.startButton.x = (width - 200) / 2;
        this.startButton.y = height / 2;
    }

    public destroy(): void {
        // Clean up event listeners
        this.startButton.removeAllListeners();

        // Remove from parent
        if (this.container.parent) {
            this.container.parent.removeChild(this.container);
        }

        // Clean up children
        this.container.removeChildren();
    }

    private onStartClick(): void {
        console.log('Start game clicked!');
        // Here you would typically switch to the game scene
        // e.g., sceneManager.switchScene('game');
    }
}
