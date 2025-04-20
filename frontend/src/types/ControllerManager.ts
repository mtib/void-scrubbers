import ControllerEvent from "./events/ControllerEvent";

interface ControllerManager {
    init(playerSeat: PlayerSeat): void;

    register(callback: (event: ControllerEvent) => void): void;

    unregister(callback: (event: ControllerEvent) => void): void;

    destroy(): void;
}

export default ControllerManager;
