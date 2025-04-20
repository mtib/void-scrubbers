abstract class ControllerEvent {
    abstract name: string;
    constructor(
        public player: PlayerSeat
    ) { }

    toStringArgs(): string[][] {
        return [
            ["player", this.player.index.toString()]
        ];
    }

    toString(): string {
        return `${this.name}(${this.toStringArgs().map(([key, value]) => `${key}=${value}`).join(", ")})`;
    }
}

export default ControllerEvent;
