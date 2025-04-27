import * as PIXI from 'pixi.js';
import AbstractComponent from './AbstractComponent';
import soundButtonOffAsset from '@/assets/sprites/sound_button_off.png';
import soundButtonOnAsset from '@/assets/sprites/sound_button_on.png';
import audioLibrary, { Music } from '@/game/AudioLibrary';

class SoundButton extends AbstractComponent {
    private container: PIXI.Container;
    private spriteOn: PIXI.Sprite;
    private spriteOff: PIXI.Sprite;
    private isOn: boolean = !audioLibrary.isMuted;
    private size: number = 40;

    constructor(size?: number) {
        super('SoundButton');

        if (size) {
            this.size = size;
        }

        this.container = new PIXI.Container();

        // Create textures
        const textureOn = PIXI.Texture.from(soundButtonOnAsset);
        const textureOff = PIXI.Texture.from(soundButtonOffAsset);

        // Apply nearest neighbor scaling for pixel art
        textureOn.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        textureOff.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

        // Create sprites
        this.spriteOn = new PIXI.Sprite(textureOn);
        this.spriteOff = new PIXI.Sprite(textureOff);

        // Set size and anchor for both sprites
        [this.spriteOn, this.spriteOff].forEach(sprite => {
            sprite.anchor.set(0.5);
            sprite.width = this.size;
            sprite.height = this.size;
        });

        // Add sprites to container (initially only the OFF is visible)
        this.container.addChild(this.spriteOn);
        this.container.addChild(this.spriteOff);
        this.updateVisibility();

        // Make button interactive
        this.container.eventMode = 'static';
        this.container.cursor = 'pointer';
        this.container.on('pointerdown', this.toggle.bind(this));
    }

    override getPIXIDisplayObject(): PIXI.DisplayObject {
        return this.container;
    }

    toggle(): void {
        this.isOn = !this.isOn;
        this.updateVisibility();

        if (this.isOn) {
            audioLibrary.playMusic(Music.MAIN_THEME);
        } else {
            audioLibrary.stopMusic();
        }
        audioLibrary.setMuted(!this.isOn);
    }

    private updateVisibility(): void {
        this.spriteOn.visible = this.isOn;
        this.spriteOff.visible = !this.isOn;
    }

    setOn(value: boolean): void {
        if (this.isOn !== value) {
            this.isOn = value;
            audioLibrary.setMuted(!this.isOn);
            this.updateVisibility();

            if (this.isOn) {
                audioLibrary.playMusic(Music.MAIN_THEME);
            } else {
                audioLibrary.stopMusic();
            }
        }
    }

    isSound(): boolean {
        return this.isOn;
    }

    override remove(): void {
        super.remove();
        this.container.removeAllListeners();
    }
}

export default SoundButton;
