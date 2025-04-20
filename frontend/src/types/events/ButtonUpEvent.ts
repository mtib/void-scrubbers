import ButtonEvent from "./ButtonEvent";

abstract class ButtonUpEvent extends ButtonEvent {
    name = "ButtonUpEvent";
    constructor(player: PlayerSeat, button: string) {
        super(player, button, false);
    }
}

export default ButtonUpEvent;
