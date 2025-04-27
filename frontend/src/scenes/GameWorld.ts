import { Log } from "@/components/Log";
import Player from "@/components/Player";
import audioLibrary, { Music } from "@/game/AudioLibrary";
import GlobalPlayerManager from "@/store/GlobalPlayerManager";
import PlayerSeat from "@/types/PlayerSeat";
import { Scene } from "@/types/Scene";
import * as PIXI from "pixi.js";

class GameWorld implements Scene {
    private ui = new PIXI.Container();
    private entities = new PIXI.Container();

    private playerCharacters: Map<PlayerSeat, Player> = new Map();
    private parent: PIXI.Container | undefined;

    private time = 0;

    init(parent: PIXI.Container): void {
        this.entities.sortableChildren = true;
        parent.addChild(this.entities);
        parent.addChild(this.ui);
        this.parent = parent;
        this.setUpPlayers();
        this.resize(window.innerWidth, window.innerHeight);
        Log.getInstance().add(this.ui);
        audioLibrary.playMusic(Music.CITY);
    }

    private setUpPlayers(): void {
        const players = GlobalPlayerManager.getInstance().players;
        const assignments = players.getAssignments();

        assignments.forEach((controller, seat) => {
            const color = (() => {
                if (seat.index % 2 === 0) {
                    return 0xFF3333;
                } else {
                    return 0x5555FF;
                }
            })();
            const player = new Player(seat, color, controller);
            player.x = Math.random() * window.innerWidth;
            player.y = Math.random() * window.innerHeight;
            this.playerCharacters.set(seat, player);
            player.add(this.entities);
        });

        players.setMenuMode(null, false);
    }

    update(delta: number): void {
        this.time += delta;
        this.playerCharacters.forEach((playerContainer) => {
            playerContainer.update(delta);
        });
        Log.getInstance().update(delta);
    }

    resize(_width: number, _height: number): void {
    }

    destroy(): void {
        this.playerCharacters.forEach((player) => {
            player.remove();
        });
        this.parent?.removeChild(this.entities);
        this.parent?.removeChild(this.ui);

        Log.getInstance().remove();
        this.entities.destroy();
        this.ui.destroy();
    }
}

export default GameWorld;
