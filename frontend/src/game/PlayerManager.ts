import ControllerManager from "@/types/ControllerManager";
import KeyboardMouseController from "./KeyboardMouseController";
import ControllerEvent from "@/types/events/ControllerEvent";

class PlayerManager {
    private nextSeatId = 0;
    private seats: PlayerSeat[] = [];
    private controllers: Map<PlayerSeat, ControllerManager | null> = new Map();

    private globalListeners: ((event: ControllerEvent) => void)[] = [];

    init(): void {
        this.seats = [];
        this.globalListeners = [];
        this.controllers = new Map();
        this.addSeat();
    }

    addSeat(): void {
        const seatId = this.nextSeatId;
        this.nextSeatId++;
        this.seats.push({
            index: seatId,
        });
        if (this.controllers.size === 0) {
            const controller = new KeyboardMouseController();
            controller.init(this.seats[0]);
            controller.register((event: ControllerEvent) => {
                this.globalListeners.forEach(callback => callback(event));
            });
            this.controllers.set(this.seats[0], controller);
        }
        // TODO auto assign a gamepad
    }

    removeSeat(seat: PlayerSeat): void {
        this.seats = this.seats.filter(s => s.index !== seat.index);
        this.controllers.delete(seat);
    }

    registerListener(seat: PlayerSeat | null, callback: (event: ControllerEvent) => void): void {
        if (!seat) {
            this.globalListeners.push(callback);
            return;
        }
        const controller = this.controllers.get(seat);
        if (controller) {
            controller.register(callback);
        }
    }

    unregisterListener(seat: PlayerSeat | null, callback: (event: ControllerEvent) => void): void {
        if (!seat) {
            this.globalListeners = this.globalListeners.filter(cb => cb !== callback);
            return;
        }
        const controller = this.controllers.get(seat);
        if (controller) {
            controller.unregister(callback);
        }
    }
}

export default PlayerManager;
