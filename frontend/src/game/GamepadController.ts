import ControllerManager from "@/types/ControllerManager";
import ControllerEvent from "@/types/events/ControllerEvent";

class GamepadController implements ControllerManager {
    // private playerSeat: PlayerSeat | null = null;
    // private gamepadIndex: number;
    private callbacks: ((event: ControllerEvent) => void)[] = [];

    constructor(_: number) {
        // this.gamepadIndex = gamepadIndex;
    }
    unregister(callback: (event: ControllerEvent) => void): void {
        this.callbacks = this.callbacks.filter(cb => cb !== callback);
    }

    destroy(): void {
        // this.playerSeat = null;
        // this.gamepadIndex = -1;
        this.callbacks = [];
    }

    init(_: PlayerSeat): void {
        // this.playerSeat = playerSeat;
    }

    register(callback: (event: ControllerEvent) => void): void {
        this.callbacks.push(callback);
    }
}

export default GamepadController;
