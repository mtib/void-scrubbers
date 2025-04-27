import TileMapSource, { TileMapPoint, TileType } from "@/types/TileMapSource";
import { createNoise2D } from 'simplex-noise';
import seedrandom from 'seedrandom';

class RandomTileMapSource implements TileMapSource {
    id: string;
    data: Map<string, TileMapPoint[]> = new Map();
    chunkSize: number = 100;
    private noise2D: ReturnType<typeof createNoise2D>;
    private waterThreshold: number = 0.3;
    private scale: number = 0.1; // Controls how zoomed in/out the noise is

    constructor(id: string, seed?: string) {
        this.id = id;
        // Use provided seed or default to the id
        const seedValue = seed || id;
        // Create seeded random number generator
        const rng = seedrandom(seedValue);
        // Initialize noise function with the seeded random
        this.noise2D = createNoise2D(rng);
    }

    worldPositionToChunk(x: number, y: number): { x: number; y: number; } {
        return { x: Math.floor(x / this.chunkSize), y: Math.floor(y / this.chunkSize) };
    }

    getChunkData(chunkX: number, chunkY: number): TileMapPoint[] {
        const cachedData = this.data.get(`${chunkX},${chunkY}`);
        if (cachedData) {
            return cachedData;
        }

        const tileMap: TileMapPoint[] = [];
        // Calculate the world position offset for this chunk
        const worldOffsetX = chunkX * this.chunkSize;
        const worldOffsetY = chunkY * this.chunkSize;

        for (let localX = 0; localX < this.chunkSize; localX++) {
            for (let localY = 0; localY < this.chunkSize; localY++) {
                // Calculate the world position for this tile
                const worldX = worldOffsetX + localX;
                const worldY = worldOffsetY + localY;

                // Generate noise value based on world coordinates for seamless chunks
                const noiseValue = this.noise2D(worldX * this.scale, worldY * this.scale);

                // Normalize noise from [-1,1] to [0,1]
                const normalizedNoise = (noiseValue + 1) * 0.5;

                // Determine tile type based on noise threshold
                const tileType = normalizedNoise > this.waterThreshold ? TileType.GRASS : TileType.WATER;

                tileMap.push({ x: localX, y: localY, type: tileType });
            }
        }

        this.data.set(`${chunkX},${chunkY}`, tileMap);
        return tileMap;
    }

    // Method to set terrain generation parameters
    setTerrainParameters(waterThreshold: number, scale: number): void {
        this.waterThreshold = waterThreshold;
        this.scale = scale;
        // Clear cache when parameters change
        this.data.clear();
    }
}

export default RandomTileMapSource;
