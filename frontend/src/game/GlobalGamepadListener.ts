import { Log } from '@/components/Log';

type GamepadActivityCallback = (gamepad: Gamepad, buttonIndex: number | null) => void;

class GlobalGamepadListener {
    private static instance: GlobalGamepadListener;

    private constructor() {
    }

    public static getInstance(): GlobalGamepadListener {
        if (!GlobalGamepadListener.instance) {
            GlobalGamepadListener.instance = new GlobalGamepadListener();
        }
        return GlobalGamepadListener.instance;
    }

    onConnect(ev: GamepadEvent) {
        const gamepad = ev.gamepad;
        Log.info(`Gamepad connected: ${gamepad.id}`);
        this.activityListeners.forEach((listener) => {
            listener(gamepad, null);
        });
    }

    onConnectHandler = this.onConnect.bind(this);

    onDisconnect(ev: GamepadEvent) {
        const gamepad = ev.gamepad;
        Log.info(`Gamepad disconnected: ${gamepad.id}`);
    }

    onDisconnectHandler = this.onDisconnect.bind(this);

    public init(): void {
        window.addEventListener('gamepadconnected', this.onConnectHandler);
        window.addEventListener('gamepaddisconnected', this.onDisconnectHandler);
        navigator.getGamepads().forEach((gamepad) => {
            if (gamepad) {
                Log.info(`Gamepad detected: ${gamepad.id}`);
            }
        });
    }

    public destroy(): void {
        window.removeEventListener('gamepadconnected', this.onConnectHandler);
        window.removeEventListener('gamepaddisconnected', this.onDisconnectHandler);
    }

    private activityListeners: GamepadActivityCallback[] = [];

    private isListeningForActivity = false;
    private startListeningForActivity() {
        if (this.isListeningForActivity) return;
        this.isListeningForActivity = true;

        const getCurrentButtonStateMap = () => {
            const gamepads = navigator.getGamepads();
            const currentButtonStateMap = new Map<number, boolean[]>();
            gamepads.forEach((gamepad) => {
                if (gamepad) {
                    const buttonStates = gamepad.buttons.map(button => button.pressed);
                    currentButtonStateMap.set(gamepad.index, buttonStates);
                }
            });
            return currentButtonStateMap;
        };

        let lastButtonStateMap = getCurrentButtonStateMap();

        const listen = () => {
            if (this.activityListeners.length == 0) {
                this.isListeningForActivity = false;
                return;
            }

            const currentButtonStateMap = getCurrentButtonStateMap();

            currentButtonStateMap.forEach((currentButtonStates, gamepadIndex) => {
                const lastButtonStates = lastButtonStateMap.get(gamepadIndex);
                if (lastButtonStates) {
                    currentButtonStates.forEach((currentButtonState, buttonIndex) => {
                        if (currentButtonState && !lastButtonStates[buttonIndex]) {
                            const gamepad = navigator.getGamepads().find(g => g && g.index === gamepadIndex);
                            if (gamepad) {
                                this.activityListeners.forEach(listener => listener(gamepad, buttonIndex));
                            }
                        }
                    });
                }
            });

            lastButtonStateMap = currentButtonStateMap;
            window.requestAnimationFrame(listen);
        };
        window.requestAnimationFrame(listen);
    }

    public registerActivityListener(callback: GamepadActivityCallback): void {
        this.activityListeners.push(callback);
        this.startListeningForActivity();
    }

    public unregisterActivityListener(callback: GamepadActivityCallback): void {
        this.activityListeners = this.activityListeners.filter(listener => listener !== callback);
    }
}

export default GlobalGamepadListener;
