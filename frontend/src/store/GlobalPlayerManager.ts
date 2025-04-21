import PlayerManager from '@/game/PlayerManager';
import PlayerSeat from '@/types/PlayerSeat';

class GlobalPlayerManager {
    static instance: GlobalPlayerManager;

    static getInstance(): GlobalPlayerManager {
        if (!GlobalPlayerManager.instance) {
            GlobalPlayerManager.instance = new GlobalPlayerManager();
        }
        return GlobalPlayerManager.instance;
    }

    players: PlayerManager;

    constructor() {
        this.players = new PlayerManager();
        this.players.init();
    }

    setMenuMode(player: PlayerSeat | null, menuMode: boolean) {
        this.players.setMenuMode(player, menuMode);
    }
}

export default GlobalPlayerManager;
