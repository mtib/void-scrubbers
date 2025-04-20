import ControllerEvent from "./ControllerEvent";

abstract class MenuEvent extends ControllerEvent {
    name = "MenuModeEvent";
    constructor(
        player: PlayerSeat,
    ) {
        super(player);
    }
}

export default MenuEvent;
