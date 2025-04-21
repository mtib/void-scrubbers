import PlayerSeat from '../PlayerSeat';
import ControllerEvent from './ControllerEvent';

class VelocityEvent extends ControllerEvent {
    name = 'VelocityEvent';
    constructor(
        player: PlayerSeat,
        public dx: number,
        public dy: number
    ) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx = length === 0 ? 0 : dx / length;
        dy = length === 0 ? 0 : dy / length;
        super(player);
    }

    toStringArgs(): string[][] {
        return [
            ...super.toStringArgs(),
            ['dx', this.dx.toString()],
            ['dy', this.dy.toString()],
        ];
    }
}

export default VelocityEvent;
