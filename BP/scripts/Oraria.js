import { Database } from "./database/Database";
import { HitboxSystem } from "./core/HitboxSystem";
import { PlayerManager } from "./core/PlayerManager";
import { EntityHandler } from "./entity/EntityHandler";
import { EventConversion } from "./events/EventConversion";
import { AbilityHandler } from "./character/abilities/AbilityHandler";
export class Oraria {
    //  static effectEngine: EffectEngine;
    //  static commandManager: CommandManager;
    constructor(world) {
        this.prefix = "[Oraria]";
        this.version = 0.1;
        new AbilityHandler();
        new EventConversion();
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
