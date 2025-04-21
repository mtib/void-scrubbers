
import ControllerManager from '@/types/ControllerManager';
import ControllerEvent from '@/types/events/ControllerEvent';
import MenuAcceptEvent from '@/types/events/MenuAcceptEvent';
import MenuDirectionEvent, { MenuDirection } from '@/types/events/MenuDirectionEvent';
import MenuRejectEvent from '@/types/events/MenuRejectEvent';
import RelativeAimEvent from '@/types/events/RelativeAimEvent';
import VelocityEvent from '@/types/events/VelocityEvent';
import { GamepadState, StickState } from '@/types/GamepadState';
import GamepadStateMapper from '@/types/GamepadStateMapper';
import PlayerSeat from '@/types/PlayerSeat';

import GenericGamepadMapper from './GenericGamepadMapper';


class GamepadController implements ControllerManager {
    // private playerSeat: PlayerSeat | null = null;
    public gamepadIndex: number;
    private playerSeat!: PlayerSeat;
    private callbacks: ((event: ControllerEvent) => void)[] = [];
    private stopped: boolean = false;
    private menuMode: boolean = false;

    private deadzone: number = 0.2;
    private denoise: number = 0.05;

    private mapper: GamepadStateMapper = new GenericGamepadMapper();

    constructor(gamepadIndex: number) {
        this.gamepadIndex = gamepadIndex;
    }

    private lastState: GamepadState | null = null;

    private inDeadzone(stick: StickState): boolean {
        return Math.sqrt(stick.dx * stick.dx + stick.dy * stick.dy) < this.deadzone;
    }

    private changedSince(lastState: StickState, newState: StickState): boolean {
        const dx = Math.abs(lastState.dx - newState.dx);
        const dy = Math.abs(lastState.dy - newState.dy);
        return Math.sqrt(
            dx * dx + dy * dy
        ) > this.denoise;
    }

    private eventsFromGamepadState(state: Gamepad): ControllerEvent[] {
        const axesStates = Array.from(state.axes);
        const buttonStates = state.buttons.map((button) => ({
            pressed: button.pressed,
        }));

        const newState: GamepadState = {
            axesStates,
            buttonStates,
        };

        if (this.lastState === null) {
            // Return early the first time to initialise
            this.lastState = newState;
            return [];
        }

        const events: ControllerEvent[] = [];

        // Get all button states through the mapper
        const buttonA = this.mapper.getAButtonState(newState);
        const buttonB = this.mapper.getBButtonState(newState);
        const dpadUp = this.mapper.getDpadUpState(newState);
        const dpadDown = this.mapper.getDpadDownState(newState);
        const dpadLeft = this.mapper.getDpadLeftState(newState);
        const dpadRight = this.mapper.getDpadRightState(newState);

        // Get stick states
        const leftStick = this.mapper.getLeftStickAxis(newState);
        const rightStick = this.mapper.getRightStickAxis(newState);

        // Get last states
        const lastButtonA = this.mapper.getAButtonState(this.lastState);
        const lastButtonB = this.mapper.getBButtonState(this.lastState);
        const lastDpadUp = this.mapper.getDpadUpState(this.lastState);
        const lastDpadDown = this.mapper.getDpadDownState(this.lastState);
        const lastDpadLeft = this.mapper.getDpadLeftState(this.lastState);
        const lastDpadRight = this.mapper.getDpadRightState(this.lastState);
        const lastLeftStick = this.mapper.getLeftStickAxis(this.lastState);
        const lastRightStick = this.mapper.getRightStickAxis(this.lastState);

        if (this.menuMode) {
            if (buttonA.pressed && !lastButtonA.pressed) {
                events.push(new MenuAcceptEvent(this.playerSeat));
            }
            if (buttonB.pressed && !lastButtonB.pressed) {
                events.push(new MenuRejectEvent(this.playerSeat));
            }
            if (dpadUp.pressed && !lastDpadUp.pressed) {
                events.push(new MenuDirectionEvent(this.playerSeat, MenuDirection.UP));
            }
            if (dpadDown.pressed && !lastDpadDown.pressed) {
                events.push(new MenuDirectionEvent(this.playerSeat, MenuDirection.DOWN));
            }
            if (dpadLeft.pressed && !lastDpadLeft.pressed) {
                events.push(new MenuDirectionEvent(this.playerSeat, MenuDirection.LEFT));
            }
            if (dpadRight.pressed && !lastDpadRight.pressed) {
                events.push(new MenuDirectionEvent(this.playerSeat, MenuDirection.RIGHT));
            }
            if (leftStick.dx > 0.5 && lastLeftStick.dx <= 0.5) {
                events.push(new MenuDirectionEvent(this.playerSeat, MenuDirection.RIGHT));
            }
            if (leftStick.dx < -0.5 && lastLeftStick.dx >= -0.5) {
                events.push(new MenuDirectionEvent(this.playerSeat, MenuDirection.LEFT));
            }
            if (leftStick.dy > 0.5 && lastLeftStick.dy <= 0.5) {
                events.push(new MenuDirectionEvent(this.playerSeat, MenuDirection.DOWN));
            }
            if (leftStick.dy < -0.5 && lastLeftStick.dy >= -0.5) {
                events.push(new MenuDirectionEvent(this.playerSeat, MenuDirection.UP));
            }
        } else {
            if (this.changedSince(lastRightStick, rightStick)) {
                if (!this.inDeadzone(rightStick)) {
                    events.push(new RelativeAimEvent(this.playerSeat, rightStick.dx, rightStick.dy));
                } else {
                    events.push(new RelativeAimEvent(this.playerSeat, 0, 0));
                }
            }
            if (this.changedSince(lastLeftStick, leftStick)) {
                if (!this.inDeadzone(leftStick)) {
                    events.push(new VelocityEvent(this.playerSeat, leftStick.dx, leftStick.dy));
                } else {
                    events.push(new VelocityEvent(this.playerSeat, 0, 0));
                }
            }
        }

        this.lastState = newState;

        return events;
    }

    init(playerSeat: PlayerSeat): void {
        this.playerSeat = playerSeat;
        const update = () => {
            if (this.stopped) {
                return;
            }
            const gamepad = navigator.getGamepads().find((gamepad) => {
                return gamepad && gamepad.index === this.gamepadIndex;
            });
            if (gamepad) {
                const controllerEvents = this.eventsFromGamepadState(gamepad);
                if (controllerEvents.length !== 0) {
                    this.callbacks.forEach(callback => {
                        controllerEvents.forEach(controllerEvent => {
                            callback(controllerEvent);
                        });
                    });
                }
            }

            window.requestAnimationFrame(() => {
                update();
            });
        };

        window.requestAnimationFrame(() => {
            update();
        });
    }

    destroy(): void {
        this.stopped = true;
        this.callbacks = [];
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
}

export default GamepadController;
