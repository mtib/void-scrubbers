import PlayerSeat from '../PlayerSeat';
import ButtonEvent from './ButtonEvent';

class KeyboardButtonPressedEvent extends ButtonEvent {
    name = 'KeyboardButtonPressedEvent';
    constructor(player: PlayerSeat, button: string, public formatted: string) {
        super(player, button, true);
    }

    toStringArgs(): string[][] {
        return [
            ...super.toStringArgs(),
            ['formatted', `"${this.formatted}"`],
        ];
    }
}

export default KeyboardButtonPressedEvent;
