import { Log } from "@/components/Log";
import Player from "@/components/Player";
import Viewport from "@/components/Viewport";
import audioLibrary, { Music } from "@/game/AudioLibrary";
import RandomTileMapSource from "@/game/RandomTileMapSource";
import TileMapRenderer from "@/game/TileMapRenderer";
import GlobalPlayerManager from "@/store/GlobalPlayerManager";
import PlayerSeat from "@/types/PlayerSeat";
import { Scene } from "@/types/Scene";
import WorldPositionable from "@/types/WorldPositionable";
import * as PIXI from "pixi.js";

class GameWorld implements Scene {
    private ui = new PIXI.Container();
    private viewport: Viewport;

    private playerCharacters: Map<PlayerSeat, Player> = new Map();
    private parent: PIXI.Container | undefined;
    private mapRenderer: TileMapRenderer = new TileMapRenderer(100, new RandomTileMapSource("test"));

    private time = 0;
    private worldBounds = {
        width: 3000,
        height: 2000
    };

    constructor() {
        // Create viewport with initial window dimensions
        this.viewport = new Viewport({
            width: window.innerWidth,
            height: window.innerHeight,
            padding: 300, // Increased padding to ensure entities remain visible
            followSpeed: 0.08, // Slightly improved follow speed
            zoomSpeed: 0.05,
            minZoom: 0.1,
            maxZoom: 1.8,
            debugDraw: false
        });
    }

    init(parent: PIXI.Container): void {
        this.parent = parent;

        // Add viewport to parent
        this.viewport.add(parent);

        // Add map and entities to viewport
        this.viewport.addChild(this.mapRenderer);

        // Add UI directly to parent (UI should be fixed, not affected by camera)
        parent.addChild(this.ui);

        this.setUpPlayers();
        this.resize(window.innerWidth, window.innerHeight);

        // Initialize the viewport's position and zoom to see everything
        this.initializeViewportPosition();

        Log.getInstance().add(this.ui);
        audioLibrary.playMusic(Music.CITY);
    }

    /**
     * Initialize the viewport position to show the entire game world
     */
    private initializeViewportPosition(): void {
        const playerPositionables = Array.from(this.playerCharacters.values());
        if (playerPositionables.length > 0) {
            // Initial follow will calculate proper position and zoom
            this.viewport.follow(playerPositionables);
        } else {
            // If no players, center on the map
            this.viewport.moveTo(this.worldBounds.width / 2, this.worldBounds.height / 2);
            this.viewport.setZoom(0.8); // Default zoom to see more of the world
        }
    }

    private setUpPlayers(): void {
        const players = GlobalPlayerManager.getInstance().players;
        const assignments = players.getAssignments();

        // Distribute players across the map in a more organized pattern
        let index = 0;
        const playerCount = assignments.size;

        assignments.forEach((controller, seat) => {
            const color = seat.index % 2 === 0 ? 0xFF3333 : 0x5555FF;
            const player = new Player(seat, color, controller);

            // Place players in different areas based on index
            const angle = (index / playerCount) * Math.PI * 2;
            const distance = Math.min(this.worldBounds.width, this.worldBounds.height) * 0.25;
            const centerX = this.worldBounds.width / 2;
            const centerY = this.worldBounds.height / 2;

            player.x = centerX + Math.cos(angle) * distance;
            player.y = centerY + Math.sin(angle) * distance;

            this.playerCharacters.set(seat, player);
            this.viewport.addChild(player.getPIXIDisplayObject());

            index++;
        });

        players.setMenuMode(null, false);
    }

    update(delta: number): void {
        this.time += delta;

        // Update players
        this.playerCharacters.forEach((playerContainer) => {
            playerContainer.update(delta);

            // Enforce world boundaries
            if (playerContainer.x < 0) playerContainer.x = 0;
            if (playerContainer.x > this.worldBounds.width) playerContainer.x = this.worldBounds.width;
            if (playerContainer.y < 0) playerContainer.y = 0;
            if (playerContainer.y > this.worldBounds.height) playerContainer.y = this.worldBounds.height;
        });

        // Get player objects as WorldPositionable for viewport tracking
        const playerPositionables: WorldPositionable[] = Array.from(this.playerCharacters.values());

        // Make viewport follow all players
        if (playerPositionables.length > 0) {
            this.viewport.follow(playerPositionables);
        }

        // Update viewport
        this.viewport.update(delta);

        // Update UI
        Log.getInstance().update(delta);
    }

    resize(width: number, height: number): void {
        // Update viewport size
        this.viewport.resize(width, height);

        // Update players
        this.playerCharacters.forEach((player) => {
            player.resize(width, height);
        });

        // Re-center viewport to ensure everything stays visible after resize
        this.initializeViewportPosition();
    }

    destroy(): void {
        this.playerCharacters.forEach((player) => {
            player.remove();
        });

        // Remove viewport from parent
        this.viewport.remove();

        // Remove UI
        if (this.parent) {
            this.parent.removeChild(this.ui);
        }

        Log.getInstance().remove();
        this.ui.destroy();
    }
}

export default GameWorld;
