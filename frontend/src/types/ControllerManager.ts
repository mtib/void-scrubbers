import ControllerEvent from './events/ControllerEvent';
import PlayerSeat from './PlayerSeat';

interface ControllerManager {
    init(playerSeat: PlayerSeat): void;

    setMenuMode(menuMode: boolean): void;

    register(callback: (event: ControllerEvent) => void): void;

    unregister(callback: (event: ControllerEvent) => void): void;

    destroy(): void;
}

export default ControllerManager;
