import ControllerManager from "@/types/ControllerManager";
import AbsoluteAimEvent from "@/types/events/AbsoluteAimEvent";
import ControllerEvent from "@/types/events/ControllerEvent";
import KeyboardButtonPressedEvent from "@/types/events/KeyboardButtonPressedEvent";
import MenuAcceptEvent from "@/types/events/MenuAcceptEvent";
import MenuDirectionEvent, { MenuDirection } from "@/types/events/MenuDirectionEvent";
import MenuRejectEvent from "@/types/events/MenuRejectEvent";

class KeyboardMouseController implements ControllerManager {
    private callbacks: ((event: ControllerEvent) => void)[] = [];
    private menuMode: boolean = false;
    private playerSeat!: PlayerSeat;

    private eventFromKeyboard(event: KeyboardEvent): ControllerEvent | null {
        if (this.menuMode) {
            if (event.code === 'Escape') {
                event.preventDefault();
                return new MenuRejectEvent(this.playerSeat);
            }
            if (event.code === 'Enter') {
                event.preventDefault();
                return new MenuAcceptEvent(this.playerSeat);
            }
            if (event.code === 'ArrowUp' || event.code === 'ArrowDown' || event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
                let direction: MenuDirection | null = null;
                switch (event.code) {
                    case 'ArrowUp':
                        direction = MenuDirection.UP;
                        break;
                    case 'ArrowDown':
                        direction = MenuDirection.DOWN;
                        break;
                    case 'ArrowLeft':
                        direction = MenuDirection.LEFT;
                        break;
                    case 'ArrowRight':
                        direction = MenuDirection.RIGHT;
                        break;
                }
                if (direction !== null) {
                    event.preventDefault();
                    return new MenuDirectionEvent(this.playerSeat, direction);
                }
            }
        }
        return new KeyboardButtonPressedEvent(this.playerSeat, event.code, event.key);
    }

    init(playerSeat: PlayerSeat): void {
        this.playerSeat = playerSeat;
        window.addEventListener('keydown', (event) => {
            const controllerEvent = this.eventFromKeyboard(event);
            if (controllerEvent === null) {
                return;
            }
            this.callbacks.forEach(callback => {
                callback(controllerEvent);
            });
        });
        window.addEventListener('mousemove', (event) => {
            this.callbacks.forEach(callback => {
                callback(new AbsoluteAimEvent(playerSeat, event.clientX, event.clientY));
            });
        });
    }

    setMenuMode(menuMode: boolean): void {
        this.menuMode = menuMode;
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
