export type ButtonState = {
    pressed: boolean;
};
export type StickState = {
    dx: number;
    dy: number;
};
export type GamepadState = {
    axesStates: number[];
    buttonStates: ButtonState[];
};
