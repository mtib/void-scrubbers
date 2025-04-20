import ControllerEvent from "./ControllerEvent";

class RelativeAimEvent extends ControllerEvent {
    name = "RelativeAimEvent";
    constructor(
        player: PlayerSeat,
        public dx: number,
        public dy: number
    ) {
        super(player);
    }

    toStringArgs(): string[][] {
        return [
            ...super.toStringArgs(),
            ["dx", this.dx.toString()],
            ["dy", this.dy.toString()],
        ];
    }
}

export default RelativeAimEvent;
