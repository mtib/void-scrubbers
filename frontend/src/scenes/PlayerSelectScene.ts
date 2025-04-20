import { Log } from "@/components/Log";
import { Scene } from "@/types/Scene";
import { theme } from "@/utils/theme";
import * as PIXI from "pixi.js";

class PlayerSelectScene implements Scene {
    private container: PIXI.Container;
    private title: PIXI.Text;
    private log: Log;
    private time: number = 0;

    constructor() {
        this.container = new PIXI.Container();

        this.title = new PIXI.Text('Player select', theme.textStyles.title);
        this.title.anchor.set(0.5, 0);
        this.title.position.set(window.innerWidth / 2, 10);

        this.log = Log.getInstance();

        this.container.addChild(this.title);
        this.container.addChild(this.log.getContainer());
    }

    init(parent: PIXI.Container): void {
        parent.addChild(this.container);
    }

    update(delta: number): void {
        this.time += delta;
        // Add a subtle pulsing effect to the title
        this.title.scale.x = 1 + Math.sin(this.time / 100) * 0.05;
        this.title.scale.y = 1 + Math.sin(this.time / 100) * 0.05;

        this.title.rotation = Math.sin(this.time / 50) * 0.01;

        // Update the log
        this.log.update(delta);
    }
    resize(width: number, _: number): void {
        this.title.position.set(width / 2, 10);
    }
    destroy(): void {
        this.container.parent.removeChild(this.container);
        this.container.removeChildren();
    }
}

export default PlayerSelectScene;
