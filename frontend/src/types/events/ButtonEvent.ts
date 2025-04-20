import ControllerEvent from "./ControllerEvent";

abstract class ButtonEvent extends ControllerEvent {
    name = "ButtonEvent";
    constructor(
        player: PlayerSeat,
        public button: string,
        public pressed: boolean
    ) {
        super(player);
    }

    toStringArgs(): string[][] {
        return [
            ...super.toStringArgs(),
            ["button", this.button],
        ];
    }
}

export default ButtonEvent;
