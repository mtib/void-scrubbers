import TileMapSource, { TileMapPoint, TileType } from "@/types/TileMapSource";

class RandomTileMapSource implements TileMapSource {
    id: string;
    data: Map<string, TileMapPoint[]> = new Map();
    chunkSize: number = 100;

    constructor(id: string) {
        this.id = id;
    }

    worldPositionToChunk(x: number, y: number): { x: number; y: number; } {
        return { x: Math.floor(x / this.chunkSize), y: Math.floor(y / this.chunkSize) };
    }

    getChunkData(x: number, y: number): TileMapPoint[] {
        const cachedData = this.data.get(`${x},${y}`);
        if (cachedData) {
            return cachedData;
        }

        const tileMap: TileMapPoint[] = [];
        for (let x = 0; x < this.chunkSize; x++) {
            for (let y = 0; y < this.chunkSize; y++) {
                const tileType = Math.random() > 0.2 ? TileType.GRASS : TileType.WATER;
                tileMap.push({ x, y, type: tileType });
            }
        }

        this.data.set(`${x},${y}`, tileMap);
        return tileMap;
    }
}

export default RandomTileMapSource;
