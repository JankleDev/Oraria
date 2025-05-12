import * as mc from "@minecraft/server";
import { PlayerStorage } from "./database/PlayerStorage";
import { PlayerManager } from "./core/PlayerManager";
import { HitboxSystem } from "./core/HitboxSystem";
import { EntityHandler } from "./entity/EntityHandler";
import { Database } from "./database/Database";

export class Oraria {
	readonly prefix: string = "[Oraria]";
	readonly version: number = 0.1;

	// Managers
	static database: Database;
	static playerManager: PlayerManager;
	static hitboxSystem: HitboxSystem;
	static playerStorage: PlayerStorage;
	static entityHandler: EntityHandler;
	//  static effectEngine: EffectEngine;
	//  static commandManager: CommandManager;

	constructor(world: mc.World) {
		Oraria.playerManager = new PlayerManager();
		Oraria.hitboxSystem = new HitboxSystem();
		Oraria.entityHandler = new EntityHandler();
		Oraria.database = new Database();
		Oraria.playerStorage = Oraria.database.playerStorage;
	}

	static getPlayerManager(): PlayerManager {
		return Oraria.playerManager;
	}

	static getHitboxSystem(): HitboxSystem {
		return Oraria.hitboxSystem;
	}

	static getPlayerStorage(): PlayerStorage {
		return Oraria.playerStorage;
	}
	
	static getEntityHandler(): EntityHandler {
		return Oraria.entityHandler;
	}
}
