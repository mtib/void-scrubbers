import PlayerManager from "@/game/PlayerManager";

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
}

export default GlobalPlayerManager;
