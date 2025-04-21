
import ControllerManager from '@/types/ControllerManager';
import ControllerEvent from '@/types/events/ControllerEvent';
import PlayerSeat from '@/types/PlayerSeat';

import { PlayerData } from '@/scenes/PlayerSelectScene';

export enum InputType {
    KEYBOARD_AND_MOUSE,
    GAMEPAD
}

class PlayerManager {
    private seatAssignments: Map<PlayerSeat, ControllerManager> = new Map();

    private globalListeners: ((event: ControllerEvent) => void)[] = [];

    private globalMenuMode = false;

    init(): void {
        this.globalListeners = [];
        this.seatAssignments = new Map();
    }

    assignSeat(index: number, data: PlayerData, controller: ControllerManager) {
        const previousAssignment = Array.from(this.seatAssignments).find(([seat]) => seat.index === index);
        if (previousAssignment) {
            const [seat] = previousAssignment;
            this.removeSeat(seat);
        }
        const seat: PlayerSeat = { index, data };
        controller.init(seat);
        controller.setMenuMode(this.globalMenuMode);
        controller.register(event => {
            this.globalListeners.forEach(callback => {
                callback(event);
            });
        });
        this.seatAssignments.set(seat, controller);
    }

    removeSeat(seat: PlayerSeat): void {
        const controller = this.seatAssignments.get(seat);
        this.seatAssignments.delete(seat);
        controller?.destroy();
    }

    registerListener(seat: PlayerSeat | null, callback: (event: ControllerEvent) => void): void {
        if (!seat) {
            this.globalListeners.push(callback);
            return;
        }
        const controller = this.seatAssignments.get(seat);
        if (controller) {
            controller.register(callback);
        }
    }

    unregisterListener(seat: PlayerSeat | null, callback: (event: ControllerEvent) => void): void {
        if (!seat) {
            this.globalListeners = this.globalListeners.filter(cb => cb !== callback);
            return;
        }
        const controller = this.seatAssignments.get(seat);
        if (controller) {
            controller.unregister(callback);
        }
    }

    setMenuMode(seat: PlayerSeat | null, menuMode: boolean): void {
        if (!seat) {
            this.globalMenuMode = menuMode;
            this.seatAssignments.forEach(controller => {
                if (controller) {
                    controller.setMenuMode(menuMode);
                }
            });
            return;
        }
        const controller = this.seatAssignments.get(seat);
        if (controller) {
            controller.setMenuMode(menuMode);
        }
    }

    getAssignments(): Map<PlayerSeat, ControllerManager> {
        return new Map(this.seatAssignments);
    }
}

export default PlayerManager;
