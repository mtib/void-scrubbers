import GamepadState, { ButtonState, StickState } from "@/types/GamepadState";
import GamepadStateMapper from "@/types/GamepadStateMapper";

class GenericGamepadMapper implements GamepadStateMapper {
    getAButtonState(gamepadState: GamepadState): ButtonState {
        return gamepadState.buttonStates[0] || { pressed: false };
    }
    getBButtonState(gamepadState: GamepadState): ButtonState {
        return gamepadState.buttonStates[1] || { pressed: false };
    }
    getXButtonState(gamepadState: GamepadState): ButtonState {
        return gamepadState.buttonStates[2] || { pressed: false };
    }
    getYButtonState(gamepadState: GamepadState): ButtonState {
        return gamepadState.buttonStates[3] || { pressed: false };
    }
    getDpadUpState(gamepadState: GamepadState): ButtonState {
        return gamepadState.buttonStates[12] || { pressed: false };
    }
    getDpadDownState(gamepadState: GamepadState): ButtonState {
        return gamepadState.buttonStates[13] || { pressed: false };
    }
    getDpadLeftState(gamepadState: GamepadState): ButtonState {
        return gamepadState.buttonStates[14] || { pressed: false };
    }
    getDpadRightState(gamepadState: GamepadState): ButtonState {
        return gamepadState.buttonStates[15] || { pressed: false };
    }
    getLeftShoulderState(gamepadState: GamepadState): ButtonState {
        return gamepadState.buttonStates[4] || { pressed: false };
    }
    getRightShoulderState(gamepadState: GamepadState): ButtonState {
        return gamepadState.buttonStates[5] || { pressed: false };
    }
    getLeftTriggerState(gamepadState: GamepadState): ButtonState {
        return gamepadState.buttonStates[6] || { pressed: false };
    }
    getRightTriggerState(gamepadState: GamepadState): ButtonState {
        return gamepadState.buttonStates[7] || { pressed: false };
    }
    getLeftStickState(gamepadState: GamepadState): ButtonState {
        return gamepadState.buttonStates[10] || { pressed: false };
    }
    getRightStickState(gamepadState: GamepadState): ButtonState {
        return gamepadState.buttonStates[11] || { pressed: false };
    }
    getLeftStickAxis(gamepadState: GamepadState): StickState {
        return {
            dx: gamepadState.axesStates[0] || 0,
            dy: gamepadState.axesStates[1] || 0
        };
    }
    getRightStickAxis(gamepadState: GamepadState): StickState {
        return {
            dx: gamepadState.axesStates[2] || 0,
            dy: gamepadState.axesStates[3] || 0
        };
    }
    getTypeName(): string {
        return "Generic";
    }
    getAButtonName(): string {
        return "A";
    }
    getBButtonName(): string {
        return "B";
    }
    getXButtonName(): string {
        return "X";
    }
    getYButtonName(): string {
        return "Y";
    }
}

export default GenericGamepadMapper;
