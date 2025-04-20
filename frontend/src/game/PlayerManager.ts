import ControllerManager from "@/types/ControllerManager";
import KeyboardMouseController from "./KeyboardMouseController";
import ControllerEvent from "@/types/events/ControllerEvent";
import GamepadController from "./GamepadController";

export enum InputType {
    KEYBOARD_AND_MOUSE,
    GAMEPAD
}

class PlayerManager {
    private nextSeatId = 0;
    private seats: PlayerSeat[] = [];
    private controllers: Map<PlayerSeat, ControllerManager | null> = new Map();

    private globalListeners: ((event: ControllerEvent) => void)[] = [];

    private globalMenuMode = false;

    init(): void {
        this.seats = [];
        this.globalListeners = [];
        this.controllers = new Map();

        // Add a default seat for the keyboard and mouse
        this.addSeat(InputType.KEYBOARD_AND_MOUSE);
    }

    addSeat(input: InputType): boolean {
        const registeredPlayerControllers = Array.from(this.controllers.values())
            .filter(controller => controller !== null);

        const seatId = this.nextSeatId;
        const seat = {
            index: seatId,
        };
        this.nextSeatId++;
        this.seats.push(seat);

        if (input === InputType.KEYBOARD_AND_MOUSE) {
            const existingKeyboardPlayerController = registeredPlayerControllers
                .find(controller => controller instanceof KeyboardMouseController);
            if (existingKeyboardPlayerController) {
                return false;
            }
            const controller = new KeyboardMouseController();
            controller.init(seat);
            controller.register((event: ControllerEvent) => {
                this.globalListeners.forEach(callback => callback(event));
            });
            controller.setMenuMode(this.globalMenuMode);
            this.controllers.set(seat, controller);
            return true;
        } else if (input === InputType.GAMEPAD) {
            const controllers = navigator.getGamepads();
            for (let i = 0; i < controllers.length; i++) {
                const gamepad = controllers[i];
                if (gamepad && gamepad.connected) {
                    const existingPlayerController = registeredPlayerControllers.find(controller => controller instanceof GamepadController && controller.gamepadIndex === gamepad.index);
                    if (existingPlayerController) {
                        continue;
                    }
                    const controller = new GamepadController(gamepad.index);
                    controller.init(seat);
                    controller.register((event: ControllerEvent) => {
                        this.globalListeners.forEach(callback => callback(event));
                    });
                    controller.setMenuMode(this.globalMenuMode);
                    this.controllers.set(seat, controller);
                }
            }
        }
        // TODO auto assign a gamepad
        return false;
    }

    removeSeat(seat: PlayerSeat): void {
        this.seats = this.seats.filter(s => s.index !== seat.index);
        this.controllers.delete(seat);
    }

    registerListener(seat: PlayerSeat | null, callback: (event: ControllerEvent) => void): void {
        if (!seat) {
            this.globalListeners.push(callback);
            return;
        }
        const controller = this.controllers.get(seat);
        if (controller) {
            controller.register(callback);
        }
    }

    unregisterListener(seat: PlayerSeat | null, callback: (event: ControllerEvent) => void): void {
        if (!seat) {
            this.globalListeners = this.globalListeners.filter(cb => cb !== callback);
            return;
        }
        const controller = this.controllers.get(seat);
        if (controller) {
            controller.unregister(callback);
        }
    }

    setMenuMode(seat: PlayerSeat | null, menuMode: boolean): void {
        if (!seat) {
            this.globalMenuMode = menuMode;
            this.controllers.forEach(controller => {
                if (controller) {
                    controller.setMenuMode(menuMode);
                }
            });
            return;
        }
        const controller = this.controllers.get(seat);
        if (controller) {
            controller.setMenuMode(menuMode);
        }
    }
}

export default PlayerManager;
