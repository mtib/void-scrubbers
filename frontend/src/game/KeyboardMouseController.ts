import ControllerManager from "@/types/ControllerManager";
import AbsoluteAimEvent from "@/types/events/AbsoluteAimEvent";
import ControllerEvent from "@/types/events/ControllerEvent";
import KeyboardButtonPressedEvent from "@/types/events/KeyboardButtonPressedEvent";

class KeyboardMouseController implements ControllerManager {
    private callbacks: ((event: ControllerEvent) => void)[] = [];

    init(playerSeat: PlayerSeat): void {
        window.addEventListener('keydown', (event) => {
            this.callbacks.forEach(callback => {
                callback(new KeyboardButtonPressedEvent(playerSeat, event.code, event.key));
            });
        });
        window.addEventListener('mousemove', (event) => {
            this.callbacks.forEach(callback => {
                callback(new AbsoluteAimEvent(playerSeat, event.clientX, event.clientY));
            });
        });
    }

    register(callback: (event: ControllerEvent) => void): void {
        this.callbacks.push(callback);
    }

    unregister(callback: (event: ControllerEvent) => void): void {
        this.callbacks = this.callbacks.filter(cb => cb !== callback);
    }

    destroy(): void {
        this.callbacks = [];
    }
}

export default KeyboardMouseController;
