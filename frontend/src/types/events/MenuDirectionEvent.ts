import MenuEvent from "./MenuEvent";

export enum MenuDirection {
    UP = 'up',
    DOWN = 'down',
    LEFT = 'left',
    RIGHT = 'right',
}

class MenuDirectionEvent extends MenuEvent {
    constructor(
        player: PlayerSeat,
        public direction: MenuDirection
    ) {
        super(player);
    }

    toStringArgs(): string[][] {
        return [
            ...super.toStringArgs(),
            ["direction", this.direction],
        ];
    }
}

export default MenuDirectionEvent;
