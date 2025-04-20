import MenuEvent from "./MenuEvent";

class MenuAcceptEvent extends MenuEvent {
    name = "MenuAcceptEvent";
    constructor(
        player: PlayerSeat,
    ) {
        super(player);
    }
}

export default MenuAcceptEvent;
