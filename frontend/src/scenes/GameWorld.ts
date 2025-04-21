import { Log } from "@/components/Log";
import GlobalPlayerManager from "@/store/GlobalPlayerManager";
import VelocityEvent from "@/types/events/VelocityEvent";
import PlayerSeat from "@/types/PlayerSeat";
import { Scene } from "@/types/Scene";
import * as PIXI from "pixi.js";

class GameWorld implements Scene {
    private ui = new PIXI.Container();
    private world = new PIXI.Container();

    private playerCharacters: Map<PlayerSeat, PIXI.Container> = new Map();
    private targetVelocity: Map<PlayerSeat, { dx: number; dy: number; }> = new Map();

    private parent: PIXI.Container | undefined;

    private time = 0;

    init(parent: PIXI.Container): void {
        parent.addChild(this.world);
        parent.addChild(this.ui);
        this.parent = parent;
        this.setUpPlayers();
        this.resize(window.innerWidth, window.innerHeight);
        Log.getInstance().add(this.ui);
    }

    private setUpPlayers(): void {
        const players = GlobalPlayerManager.getInstance().players;
        const assignments = players.getAssignments();

        assignments.forEach((controller, seat) => {
            const playerContainer = new PIXI.Container();
            playerContainer.name = `Player ${seat.index}`;
            const placeholderGraphics = new PIXI.Graphics();
            if (seat.index % 2 === 0) {
                placeholderGraphics.beginFill(0xFF0000);
            } else {
                placeholderGraphics.beginFill(0x0000FF);
            }
            placeholderGraphics.drawCircle(0, 0, 50);
            placeholderGraphics.endFill();
            playerContainer.x = Math.random() * window.innerWidth;
            playerContainer.y = Math.random() * window.innerHeight;
            playerContainer.addChild(placeholderGraphics);
            this.playerCharacters.set(seat, playerContainer);
            this.world.addChild(playerContainer);

            controller.register((event) => {
                if (event instanceof VelocityEvent) {
                    this.targetVelocity.set(seat, { dx: event.dx, dy: event.dy });
                }
            });
        });

        players.setMenuMode(null, false);
    }

    update(delta: number): void {
        this.time += delta;

        this.playerCharacters.forEach((playerContainer, seat) => {
            const velocity = this.targetVelocity.get(seat);
            if (velocity) {
                playerContainer.x += velocity.dx * delta * 5;
                playerContainer.y += velocity.dy * delta * 5;

                // Keep the player within the bounds of the world
                if (playerContainer.x < 0) playerContainer.x = 0;
                if (playerContainer.x > window.innerWidth) playerContainer.x = window.innerWidth;
                if (playerContainer.y < 0) playerContainer.y = 0;
                if (playerContainer.y > window.innerHeight) playerContainer.y = window.innerHeight;
            }
        });
    }

    resize(_width: number, _height: number): void {
    }

    destroy(): void {
        this.parent?.removeChild(this.world);
        this.parent?.removeChild(this.ui);

        Log.getInstance().remove();
        this.world.destroy();
        this.ui.destroy();
    }
}

export default GameWorld;
