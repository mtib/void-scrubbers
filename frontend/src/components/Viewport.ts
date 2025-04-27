import * as PIXI from 'pixi.js';
import AbstractComponent from './AbstractComponent';
import WorldPositionable from '@/types/WorldPositionable';

export interface ViewportOptions {
    width: number;
    height: number;
    padding?: number;
    minZoom?: number;
    maxZoom?: number;
    followSpeed?: number;
    zoomSpeed?: number;
    debugDraw?: boolean;
}

/**
 * Viewport component that acts as a camera to follow game entities
 */
export class Viewport extends AbstractComponent {
    private container: PIXI.Container;
    private worldContainer: PIXI.Container;
    private debugGraphics: PIXI.Graphics;
    private targetPosition: PIXI.Point = new PIXI.Point(0, 0);
    private targetZoom: number = 1;

    private options: Required<ViewportOptions>;

    private defaultOptions: Required<ViewportOptions> = {
        width: 800,
        height: 600,
        padding: 100,
        minZoom: 0.5,
        maxZoom: 2,
        followSpeed: 0.1,
        zoomSpeed: 0.05,
        debugDraw: false
    };

    constructor(options: ViewportOptions) {
        super('Viewport');
        this.options = { ...this.defaultOptions, ...options };

        // Create the main container that will be moved for camera effects
        this.worldContainer = new PIXI.Container();

        // Create an outer container that stays fixed
        this.container = new PIXI.Container();
        this.container.addChild(this.worldContainer);

        // Initialize the world container position
        this.worldContainer.position.set(this.options.width / 2, this.options.height / 2);

        // Debug graphics
        this.debugGraphics = new PIXI.Graphics();
        this.container.addChild(this.debugGraphics);
    }

    /**
     * Follow a set of WorldPositionable objects
     */
    public follow(targets: WorldPositionable[]): void {
        if (targets.length === 0) return;

        // Calculate center point of all targets
        let centerX = 0;
        let centerY = 0;

        // Calculate the bounding box of all targets
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        targets.forEach(target => {
            const position = target.getWorldPosition();
            centerX += position.x;
            centerY += position.y;

            minX = Math.min(minX, position.x);
            minY = Math.min(minY, position.y);
            maxX = Math.max(maxX, position.x);
            maxY = Math.max(maxY, position.y);
        });

        centerX /= targets.length;
        centerY /= targets.length;

        // Set target position (negative because we move the world, not the camera)
        this.targetPosition.set(
            -centerX * this.worldContainer.scale.x + this.options.width / 2,
            -centerY * this.worldContainer.scale.y + this.options.height / 2
        );

        // Calculate required zoom based on bounding box size plus padding
        const boundWidth = maxX - minX + this.options.padding * 2;
        const boundHeight = maxY - minY + this.options.padding * 2;

        // Determine the zoom needed to fit the bounds within the viewport
        // We need to ensure both dimensions fit, so take the smaller zoom factor
        const zoomX = this.options.width / boundWidth;
        const zoomY = this.options.height / boundHeight;

        // Use the smaller zoom to ensure everything fits
        this.targetZoom = Math.min(zoomX, zoomY);

        // Clamp zoom to min/max
        this.targetZoom = Math.max(this.options.minZoom, Math.min(this.options.maxZoom, this.targetZoom));

        // Debug visualization
        if (this.options.debugDraw) {
            this.debugGraphics.clear();
            this.debugGraphics.lineStyle(1, 0xFF0000);

            // Draw bounding box
            const boundsX = this.options.width / 2 - (boundWidth * this.worldContainer.scale.x) / 2 + this.worldContainer.position.x - centerX * this.worldContainer.scale.x;
            const boundsY = this.options.height / 2 - (boundHeight * this.worldContainer.scale.y) / 2 + this.worldContainer.position.y - centerY * this.worldContainer.scale.y;

            this.debugGraphics.drawRect(
                boundsX,
                boundsY,
                boundWidth * this.worldContainer.scale.x,
                boundHeight * this.worldContainer.scale.y
            );

            // Draw center point
            this.debugGraphics.lineStyle(1, 0x00FF00);
            this.debugGraphics.drawCircle(
                this.options.width / 2 + (this.worldContainer.position.x - centerX * this.worldContainer.scale.x),
                this.options.height / 2 + (this.worldContainer.position.y - centerY * this.worldContainer.scale.y),
                5
            );

            // Draw viewport center
            this.debugGraphics.lineStyle(1, 0x0000FF);
            this.debugGraphics.drawCircle(
                this.options.width / 2,
                this.options.height / 2,
                7
            );

            this.debugGraphics.endFill();
        }
    }

    /**
     * Add a container to the viewport
     */
    public addChild(child: PIXI.DisplayObject): void {
        this.worldContainer.addChild(child);
    }

    /**
     * Remove a container from the viewport
     */
    public removeChild(child: PIXI.DisplayObject): void {
        this.worldContainer.removeChild(child);
    }

    /**
     * Get all children from the viewport
     */
    public getChildren(): PIXI.DisplayObject[] {
        return this.worldContainer.children;
    }

    /**
     * Set the size of the viewport
     */
    public resize(width: number, height: number): void {
        this.options.width = width;
        this.options.height = height;
    }

    /**
     * Update the viewport position and zoom with smooth interpolation
     */
    override update(delta: number): void {
        super.update(delta);

        // Smoothly move toward target position
        const deltaX = this.targetPosition.x - this.worldContainer.position.x;
        const deltaY = this.targetPosition.y - this.worldContainer.position.y;

        // Apply damping for smoother movement
        this.worldContainer.position.x += deltaX * this.options.followSpeed * Math.min(delta, 16);
        this.worldContainer.position.y += deltaY * this.options.followSpeed * Math.min(delta, 16);

        // Smoothly adjust zoom
        const deltaZoom = this.targetZoom - this.worldContainer.scale.x;
        const zoomChange = deltaZoom * this.options.zoomSpeed * Math.min(delta, 16);

        const newZoom = this.worldContainer.scale.x + zoomChange;
        this.worldContainer.scale.set(newZoom, newZoom);
    }

    /**
     * Convert screen coordinates to world coordinates
     */
    public screenToWorld(screenX: number, screenY: number): PIXI.Point {
        const worldX = (screenX - this.worldContainer.position.x) / this.worldContainer.scale.x;
        const worldY = (screenY - this.worldContainer.position.y) / this.worldContainer.scale.y;
        return new PIXI.Point(worldX, worldY);
    }

    /**
     * Convert world coordinates to screen coordinates
     */
    public worldToScreen(worldX: number, worldY: number): PIXI.Point {
        const screenX = worldX * this.worldContainer.scale.x + this.worldContainer.position.x;
        const screenY = worldY * this.worldContainer.scale.y + this.worldContainer.position.y;
        return new PIXI.Point(screenX, screenY);
    }

    /**
     * Get the PIXI container for the viewport
     */
    override getPIXIDisplayObject(): PIXI.DisplayObject {
        return this.container;
    }

    /**
     * Move the viewport to a specific position instantly
     */
    public moveTo(x: number, y: number): void {
        this.targetPosition.set(
            this.options.width / 2 - x,
            this.options.height / 2 - y
        );
        this.worldContainer.position.copyFrom(this.targetPosition);
    }

    /**
     * Set zoom level instantly
     */
    public setZoom(zoom: number): void {
        this.targetZoom = Math.max(this.options.minZoom, Math.min(this.options.maxZoom, zoom));
        this.worldContainer.scale.set(this.targetZoom);
    }
}

export default Viewport;
