import ButtonEvent from "./ButtonEvent";

abstract class ButtonDownEvent extends ButtonEvent {
    name = "ButtonDownEvent";
    constructor(player: PlayerSeat, button: string) {
        super(player, button, true);
    }
}

export default ButtonDownEvent;
