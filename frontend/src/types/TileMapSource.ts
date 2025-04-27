export type TileMapPoint = {
    x: number;
    y: number;
    type: TileType;
};

export type Tile = {
    northEast: TileMapPoint;
    SouthEast: TileMapPoint;
    SouthWest: TileMapPoint;
    NorthWest: TileMapPoint;
};

export enum TileType {
    GRASS = 'grass',
    WATER = 'water',
}

interface TileMapSource {
    id: string;

    worldPositionToChunk(x: number, y: number): { x: number; y: number; };
    getChunkData(x: number, y: number): TileMapPoint[];
}

export default TileMapSource;
