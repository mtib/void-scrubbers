import TileMapSource, { TileType } from '@/types/TileMapSource';
import * as PIXI from 'pixi.js';
import spriteSheetAsset from '@/assets/sprites/tile.png';

const tileAtlas = {
    frames: {
        waterFull: {
            frame: {
                x: 0,
                y: 0,
                w: 10,
                h: 10,
            }
        },
        grassRight: {
            frame: {
                x: 10,
                y: 0,
                w: 10,
                h: 10,
            }
        },
        grassTopRight: {
            frame: {
                x: 20,
                y: 0,
                w: 10,
                h: 10,
            }
        },
        grassDiagonal: {
            frame: {
                x: 30,
                y: 0,
                w: 10,
                h: 10,
            }
        },
        waterTopLeft: {
            frame: {
                x: 40,
                y: 0,
                w: 10,
                h: 10,
            }
        },
        grassFull: {
            frame: {
                x: 50,
                y: 0,
                w: 10,
                h: 10,
            }
        },
    },
    meta: {
        image: spriteSheetAsset,
        format: 'RGBA8888',
        size: { w: 60, h: 10 },
        scale: '1',
    },
} as PIXI.SpriteSheetJson;

const texture = PIXI.Texture.from(tileAtlas.meta.image);
texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
const spriteSheet = new PIXI.Spritesheet(
    texture,
    tileAtlas
);
(async () => {
    await spriteSheet.parse();
})();

class TileMapRenderer extends PIXI.Container {
    private graphics: PIXI.Graphics = new PIXI.Graphics();
    private tileMap: PIXI.Container = new PIXI.Container();
    private debugDraw: boolean = false;

    private mapWidth: number = 100;
    private mapHeight: number = 100;

    constructor(public tileSize: number, private source: TileMapSource) {
        super();
        this.renderTileMap();
        this.addChild(this.tileMap);
        this.addChild(this.graphics);
    }

    private renderTileMap(): void {
        const data = this.source.getChunkData(0, 0);
        const map = new Map<string, TileType>();

        // Clear existing tiles
        this.tileMap.removeChildren();

        // First pass: build the tile map
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const tileValue = data.find(tile => tile.x === x && tile.y === y);
                if (tileValue === undefined) {
                    continue;
                }
                const tileKey = `${tileValue.x},${tileValue.y}`;
                const tileType = tileValue.type;
                map.set(tileKey, tileType);

                if (this.debugDraw) {
                    if (tileType === TileType.GRASS) {
                        this.graphics.beginFill(0x00FF00, 0.5);
                    } else if (tileType === TileType.WATER) {
                        this.graphics.beginFill(0x0000FF, 0.5);
                    }
                    this.graphics.drawCircle(
                        x * this.tileSize,
                        y * this.tileSize,
                        this.tileSize / 5
                    );
                    this.graphics.endFill();
                }
            }
        }

        // Second pass: render tiles using marching squares-like algorithm
        for (let y = 0; y < this.mapHeight - 1; y++) {
            for (let x = 0; x < this.mapWidth - 1; x++) {
                // Get the state of the 4 corners (top-left, top-right, bottom-right, bottom-left)
                const topLeft = this.getTileType(map, x, y) === TileType.GRASS;
                const topRight = this.getTileType(map, x + 1, y) === TileType.GRASS;
                const bottomRight = this.getTileType(map, x + 1, y + 1) === TileType.GRASS;
                const bottomLeft = this.getTileType(map, x, y + 1) === TileType.GRASS;

                // Determine which tile to use based on the configuration
                const { spriteName: tileName, rotation } = this.rotateUntilMatch(
                    topLeft,
                    topRight,
                    bottomRight,
                    bottomLeft
                );

                // Create and position the sprite
                const sprite = new PIXI.Sprite(spriteSheet.textures[tileName]);
                sprite.x = x * this.tileSize + this.tileSize / 2;
                sprite.y = y * this.tileSize + this.tileSize / 2;
                sprite.anchor.set(0.5);
                sprite.width = this.tileSize;
                sprite.height = this.tileSize;
                sprite.angle = rotation * (180 / Math.PI); // Convert radians to degrees

                this.tileMap.addChild(sprite);
            }
        }
    }

    private rotateUntilMatch(
        topLeft: boolean,
        topRight: boolean,
        bottomRight: boolean,
        bottomLeft: boolean,
        rotation: number = 0
    ): {
        spriteName: string;
        rotation: number;
    } {
        if (rotation >= Math.PI * 2) {
            throw new Error('Rotation exceeded 360 degrees');
        }
        let tileName: string | null = null;
        if (topLeft && topRight && bottomRight && bottomLeft) {
            tileName = 'grassFull';
        } else if (!topLeft && topRight && bottomRight && bottomLeft) {
            tileName = 'waterTopLeft';
        } else if (!topLeft && topRight && bottomRight && !bottomLeft) {
            tileName = 'grassRight';
        } else if (!topLeft && topRight && !bottomRight && bottomLeft) {
            tileName = 'grassDiagonal';
        } else if (!topLeft && topRight && !bottomRight && !bottomLeft) {
            tileName = 'grassTopRight';
        } else if (!topLeft && !topRight && !bottomRight && !bottomLeft) {
            tileName = 'waterFull';
        }

        if (tileName !== null) {
            return { spriteName: tileName, rotation };
        }
        return this.rotateUntilMatch(topRight, bottomRight, bottomLeft, topLeft, rotation + Math.PI / 2);
    }

    private getTileType(map: Map<string, TileType>, x: number, y: number): TileType | undefined {
        const key = `${x},${y}`;
        return map.get(key);
    }
}

export default TileMapRenderer;
