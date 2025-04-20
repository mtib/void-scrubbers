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
}

export default RelativeAimEvent;
