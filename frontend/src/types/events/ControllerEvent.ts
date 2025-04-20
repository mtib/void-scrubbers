abstract class ControllerEvent {
    abstract name: string;
    timestamp: number;

    constructor(
        public player: PlayerSeat
    ) {
        this.timestamp = Date.now();
    }

    toStringArgs(): string[][] {
        return [
            ["seat", this.player.index.toString()]
        ];
    }

    toString(): string {
        return `${this.name}(${this.toStringArgs().map(([key, value]) => `${key}=${value}`).join(", ")})`;
    }
}

export default ControllerEvent;
