import ControllerEvent from "./ControllerEvent";

class VelocityEvent extends ControllerEvent {
    name = "VelocityEvent";
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

export default VelocityEvent;
