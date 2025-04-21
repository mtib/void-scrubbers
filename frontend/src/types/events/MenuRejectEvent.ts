import PlayerSeat from '../PlayerSeat';
import MenuEvent from './MenuEvent';

class MenuRejectEvent extends MenuEvent {
    name = 'MenuRejectEvent';
    constructor(
        player: PlayerSeat,
    ) {
        super(player);
    }
}

export default MenuRejectEvent;
