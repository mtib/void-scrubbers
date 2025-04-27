import * as PIXI from 'pixi.js';

/**
 * Interface for objects that have a position in the game world
 * and can be followed by the camera
 */
export interface WorldPositionable {
    /**
     * Get the display object that should be rendered in the world
     */
    getPIXIDisplayObject(): PIXI.DisplayObject;

    /**
     * Get the world position of this object
     */
    getWorldPosition(): PIXI.Point;
}

export default WorldPositionable;
