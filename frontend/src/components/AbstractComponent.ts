import * as PIXI from 'pixi.js';

abstract class AbstractComponent {
    private parent: PIXI.Container | null = null;
    private time: number = 0;
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    abstract getPIXIDisplayObject(): PIXI.DisplayObject;

    set x(
        value: number
    ) {
        this.getPIXIDisplayObject().x = value;
    }

    set y(
        value: number
    ) {
        this.getPIXIDisplayObject().y = value;
    }

    set position(
        value: { x: number; y: number; }
    ) {
        this.getPIXIDisplayObject().position.set(value.x, value.y);
    }

    update(
        delta: number
    ): void {
        this.time += delta;
    }

    add(
        parent: PIXI.Container
    ): void {
        this.time = 0;
        this.parent = parent;
        this.parent.addChild(this.getPIXIDisplayObject());
    }

    remove(): void {
        if (this.parent) {
            this.parent.removeChild(this.getPIXIDisplayObject());
        }
        this.parent = null;
    }
}

export default AbstractComponent;
