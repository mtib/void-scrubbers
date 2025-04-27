import * as PIXI from 'pixi.js';
import AbstractComponent from './AbstractComponent';
import PlayerSeat from '@/types/PlayerSeat';
import spriteSheetAsset from '@/assets/sprites/robo_1.png';
import ControllerManager from '@/types/ControllerManager';
import VelocityEvent from '@/types/events/VelocityEvent';
import { theme } from '@/utils/theme';
import OutlineFilter from '@/shaders/OutlineShader';

const robo1Atlas = {
    frames: {
        robo1_1: {
            frame: { x: 0, y: 0, w: 10, h: 16 },
        },
        robo1_2: {
            frame: { x: 10, y: 0, w: 10, h: 16 },
        },
        robo1_3: {
            frame: { x: 20, y: 0, w: 10, h: 16 },
        },
        robo1_4: {
            frame: { x: 30, y: 0, w: 10, h: 16 },
        },
        robo1_5: {
            frame: { x: 40, y: 0, w: 10, h: 16 },
        },
        robo1_6: {
            frame: { x: 50, y: 0, w: 10, h: 16 },
        }
    },
    meta: {
        image: spriteSheetAsset,
        format: 'RGBA8888',
        size: { w: 60, h: 16 },
        scale: '1',
    },
    animations: {
        robo1: ['robo1_1', 'robo1_2', 'robo1_3', 'robo1_4', 'robo1_5', 'robo1_6'],
    }
} as PIXI.SpriteSheetJson;

const texture = PIXI.Texture.from(robo1Atlas.meta.image);
texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
const spriteSheet = new PIXI.Spritesheet(
    texture,
    robo1Atlas
);


(async () => {
    await spriteSheet.parse();
})();

class Player extends AbstractComponent {
    private sprite: PIXI.AnimatedSprite;
    private container: PIXI.Container;
    private spriteContainer: PIXI.Container;
    private nameTag: PIXI.Text;
    private targetVelocity: { dx: number; dy: number; } = { dx: 0, dy: 0 };
    private graphics: PIXI.Graphics = new PIXI.Graphics();
    private blinkOffset: number = Math.random() * Player.blinkInterval;
    private blinkIntervalRandomness: number = Math.random() * 100;

    private interpolatedVelocity: { dx: number; dy: number; } = { dx: 0, dy: 0 };

    static size = 6;
    static movementSpeed = 5;
    static floatyness = 5;

    static blinkInterval = 200;

    constructor(public player: PlayerSeat, public color: number, controller: ControllerManager) {
        super(`Player ${player.data.displayName}`);

        controller.register((event) => {
            if (event instanceof VelocityEvent) {
                this.targetVelocity = { dx: event.dx, dy: event.dy };
            }
        });

        this.sprite = new PIXI.AnimatedSprite(spriteSheet.animations['robo1']);
        this.sprite.animationSpeed = 0.1;
        this.sprite.anchor.set(0.5, 1);
        this.sprite.scale.set(Player.size);

        this.spriteContainer = new PIXI.Container();
        this.spriteContainer.addChild(this.sprite);
        this.spriteContainer.addChild(this.graphics);
        this.spriteContainer.filters = [new OutlineFilter(color)];

        this.nameTag = new PIXI.Text(player.data.displayName, theme.textStyles.body);
        this.nameTag.anchor.set(0.5, 0);

        this.container = new PIXI.Container();
        this.container.addChild(this.spriteContainer);
        this.container.addChild(this.nameTag);
    }

    getPIXIDisplayObject(): PIXI.DisplayObject {
        return this.container;
    }

    resize(_width: number, _height: number): void {
    }

    update(delta: number): void {
        super.update(delta);
        const dx = (this.targetVelocity.dx - this.interpolatedVelocity.dx) * (1 / Player.floatyness) * delta;
        const dy = (this.targetVelocity.dy - this.interpolatedVelocity.dy) * (1 / Player.floatyness) * delta;
        this.interpolatedVelocity.dy += dy;

        if (Math.abs(dx) > 0.01) {
            this.interpolatedVelocity.dx += dx;
        } else {
            this.interpolatedVelocity.dx = this.targetVelocity.dx;
        }

        if (Math.abs(dy) > 0.01) {
            this.interpolatedVelocity.dy += dy;
        } else {
            this.interpolatedVelocity.dy = this.targetVelocity.dy;
        }

        this.sprite.x += this.interpolatedVelocity.dx * delta * Player.movementSpeed;
        this.sprite.y += this.interpolatedVelocity.dy * delta * Player.movementSpeed;

        if (this.interpolatedVelocity.dx !== 0 || this.interpolatedVelocity.dy !== 0) {
            this.sprite.play();
        } else {
            this.sprite.stop();
        }
        if (this.interpolatedVelocity.dx > 0.1) {
            this.sprite.scale.x = Player.size;
        } else if (this.interpolatedVelocity.dx < -0.1) {
            this.sprite.scale.x = -Player.size;
        }

        // Keep the player within the bounds of the world
        if (this.sprite.x < 0) this.sprite.x = 0;
        if (this.sprite.x > window.innerWidth) this.sprite.x = window.innerWidth;
        if (this.sprite.y < 0) this.sprite.y = 0;
        if (this.sprite.y > window.innerHeight) this.sprite.y = window.innerHeight;

        this.nameTag.position.set(this.sprite.x, this.sprite.y + 5);

        this.drawGraphics();

        this.container.zIndex = this.sprite.y;
    }

    private drawGraphics(): void {
        this.graphics.clear();
        this.graphics.beginFill(this.color, 1);
        const facingLeft = this.sprite.scale.x < 0;
        // draw antenna
        this.graphics.drawRect(
            this.sprite.x + (facingLeft ? -2 * Player.size - 1 : Player.size + 1),
            this.sprite.y - Player.size * 16 - 1,
            Player.size,
            Player.size
        );
        // draw eyes
        const drawEye = (x: number, y: number, w: number, h: number) => {
            this.graphics.drawRect(
                x - w / 2,
                y - h / 2,
                w,
                h
            );
        };

        const leftEyeDefaultPosition = {
            x: this.sprite.x + (facingLeft ? -2.0 * Player.size : 0),
            y: this.sprite.y - Player.size * 10.5,
        };
        const rightEyeDefaultPosition = {
            x: this.sprite.x + (facingLeft ? 0 : 2 * Player.size),
            y: this.sprite.y - Player.size * 10.5,
        };

        const movementScale = 0.8;
        const maxDx = movementScale * Player.size;
        const eyeOpenness = (this.time + this.blinkOffset) % (Player.blinkInterval + this.blinkIntervalRandomness) < Player.blinkInterval / 10 ? 0.2 : 1;
        drawEye(leftEyeDefaultPosition.x + this.interpolatedVelocity.dx * maxDx, leftEyeDefaultPosition.y + this.interpolatedVelocity.dy * maxDx * movementScale, Player.size, 1.5 * Player.size * eyeOpenness);
        drawEye(rightEyeDefaultPosition.x + this.interpolatedVelocity.dx * maxDx, rightEyeDefaultPosition.y + this.interpolatedVelocity.dy * maxDx * movementScale, Player.size, 1.5 * Player.size * eyeOpenness);

        this.graphics.endFill();

        // Hacky solution to enlarge the containing container to make space for the outline
        this.graphics.beginFill(0x000000, 0.000001);
        this.graphics.drawRect(
            this.sprite.x - Player.size * 6,
            this.sprite.y - Player.size * 17,
            Player.size * 12,
            Player.size * 18
        );
        this.graphics.endFill();
    }

    set x(value: number) {
        this.sprite.x = value;
    }

    set y(value: number) {
        this.sprite.y = value;
    }

    add(parent: PIXI.Container): void {
        super.add(parent);
        this.sprite.play();
    }

    remove(): void {
        super.remove();
        this.sprite.stop();
    }
}

export default Player;
