import { ButtonState, GamepadState, StickState } from './GamepadState';

interface GamepadStateMapper {
    getAButtonState(gamepadState: GamepadState): ButtonState;
    getBButtonState(gamepadState: GamepadState): ButtonState;
    getXButtonState(gamepadState: GamepadState): ButtonState;
    getYButtonState(gamepadState: GamepadState): ButtonState;
    getDpadUpState(gamepadState: GamepadState): ButtonState;
    getDpadDownState(gamepadState: GamepadState): ButtonState;
    getDpadLeftState(gamepadState: GamepadState): ButtonState;
    getDpadRightState(gamepadState: GamepadState): ButtonState;
    getLeftShoulderState(gamepadState: GamepadState): ButtonState;
    getRightShoulderState(gamepadState: GamepadState): ButtonState;
    getLeftTriggerState(gamepadState: GamepadState): ButtonState;
    getRightTriggerState(gamepadState: GamepadState): ButtonState;
    getLeftStickState(gamepadState: GamepadState): ButtonState;
    getRightStickState(gamepadState: GamepadState): ButtonState;
    getLeftStickAxis(gamepadState: GamepadState): StickState;
    getRightStickAxis(gamepadState: GamepadState): StickState;

    getTypeName(): string;
    getAButtonName(): string;
    getBButtonName(): string;
    getXButtonName(): string;
    getYButtonName(): string;
}

export default GamepadStateMapper;
