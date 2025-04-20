import { Log } from '@/components/Log';
import GlobalPlayerManager from '@/store/GlobalPlayerManager';
import { InputType } from './PlayerManager';

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
        GlobalPlayerManager.getInstance().players.addSeat(InputType.GAMEPAD);
    }

    onConnectHandler = this.onConnect.bind(this);

    onDisconnect(ev: GamepadEvent) {
        const gamepad = ev.gamepad;
        Log.info(`Gamepad disconnected: ${gamepad.id}`);
    }

    onDisconnectHandler = this.onDisconnect.bind(this);

    public init(): void {
        window.addEventListener("gamepadconnected", this.onConnectHandler);
        window.addEventListener("gamepaddisconnected", this.onDisconnectHandler);
        navigator.getGamepads().forEach((gamepad) => {
            if (gamepad) {
                Log.info(`Gamepad detected: ${gamepad.id}`);
            }
        });
    }

    public destroy(): void {
        window.removeEventListener("gamepadconnected", this.onConnectHandler);
        window.removeEventListener("gamepaddisconnected", this.onDisconnectHandler);
    }
}

export default GlobalGamepadListener;
