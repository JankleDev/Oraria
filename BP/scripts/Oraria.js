import { PlayerManager } from "./core/PlayerManager";
import { HitboxSystem } from "./core/HitboxSystem";
import { EntityHandler } from "./entity/EntityHandler";
import { Database } from "./database/Database";
export class Oraria {
    //  static effectEngine: EffectEngine;
    //  static commandManager: CommandManager;
    constructor(world) {
        this.prefix = "[Oraria]";
        this.version = 0.1;
        Oraria.playerManager = new PlayerManager();
        Oraria.hitboxSystem = new HitboxSystem();
        Oraria.entityHandler = new EntityHandler();
        Oraria.database = new Database();
        Oraria.playerStorage = Oraria.database.playerStorage;
    }
    static getPlayerManager() {
        return Oraria.playerManager;
    }
    static getHitboxSystem() {
        return Oraria.hitboxSystem;
    }
    static getPlayerStorage() {
        return Oraria.playerStorage;
    }
    static getEntityHandler() {
        return Oraria.entityHandler;
    }
}
