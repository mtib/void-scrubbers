import ControllerManager from '@/types/ControllerManager';
import AbsoluteAimEvent from '@/types/events/AbsoluteAimEvent';
import ControllerEvent from '@/types/events/ControllerEvent';
import KeyboardButtonPressedEvent from '@/types/events/KeyboardButtonPressedEvent';
import MenuAcceptEvent from '@/types/events/MenuAcceptEvent';
import MenuDirectionEvent, { MenuDirection } from '@/types/events/MenuDirectionEvent';
import MenuRejectEvent from '@/types/events/MenuRejectEvent';
import VelocityEvent from '@/types/events/VelocityEvent';
import PlayerSeat from '@/types/PlayerSeat';

enum MovementKey {
    UP = 'KeyW',
    DOWN = 'KeyS',
    LEFT = 'KeyA',
    RIGHT = 'KeyD',
}

class KeyboardMouseController implements ControllerManager {
    private callbacks: ((event: ControllerEvent) => void)[] = [];
    private menuMode: boolean = false;
    private playerSeat!: PlayerSeat;

    private movementKeyState: Map<MovementKey, boolean> = new Map(
        Object.values(MovementKey).map((key) => [key, false])
    );

    private getMovementKeyFromCode(key: string): MovementKey | null {
        for (const movementKey of Object.values(MovementKey)) {
            if (key === movementKey) {
                return movementKey;
            }
        }
        return null;
    }

    private eventFromKeyboard(event: KeyboardEvent): ControllerEvent | null {
        if (this.menuMode && event.type === 'keydown') {
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
            return new KeyboardButtonPressedEvent(this.playerSeat, event.code, event.key);
        }
        const movementKey = this.getMovementKeyFromCode(event.code);
        if (movementKey) {
            if (event.type === 'keydown') {
                this.movementKeyState.set(movementKey, true);
            } else if (event.type === 'keyup') {
                this.movementKeyState.set(movementKey, false);
            }
            const dx = (this.movementKeyState.get(MovementKey.RIGHT) ? 1 : 0) - (this.movementKeyState.get(MovementKey.LEFT) ? 1 : 0);
            const dy = (this.movementKeyState.get(MovementKey.DOWN) ? 1 : 0) - (this.movementKeyState.get(MovementKey.UP) ? 1 : 0);
            return new VelocityEvent(this.playerSeat, dx, dy);
        }

        return null;
    }

    private unbindCallacks: (() => void)[] = [];

    init(playerSeat: PlayerSeat): void {
        this.playerSeat = playerSeat;
        const handleKeyDown = (event: KeyboardEvent) => {
            const controllerEvent = this.eventFromKeyboard(event);
            if (controllerEvent === null) {
                return;
            }
            this.callbacks.forEach(callback => {
                callback(controllerEvent);
            });
        };
        const handleKeyUp = (event: KeyboardEvent) => {
            const controllerEvent = this.eventFromKeyboard(event);
            if (controllerEvent === null) {
                return;
            }
            this.callbacks.forEach(callback => {
                callback(controllerEvent);
            });
        };
        const handleMouseMove = (event: MouseEvent) => {
            this.callbacks.forEach(callback => {
                callback(new AbsoluteAimEvent(playerSeat, event.clientX, event.clientY));
            });
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('mousemove', handleMouseMove);

        this.unbindCallacks.push(() => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('mousemove', handleMouseMove);
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
        this.unbindCallacks.forEach(unbind => {
            unbind();
        });
        this.callbacks = [];
    }
}

export default KeyboardMouseController;
