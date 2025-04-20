import ControllerEvent from "./ControllerEvent";

class AbsoluteAimEvent extends ControllerEvent {
    name = "AbsoluteAimEvent";
    constructor(
        player: PlayerSeat,
        public x: number,
        public y: number
    ) {
        super(player);
    }

    toStringArgs(): string[][] {
        return [
            ...super.toStringArgs(),
            ["x", this.x.toString()],
            ["y", this.y.toString()],
        ];
    }
}

export default AbsoluteAimEvent;
