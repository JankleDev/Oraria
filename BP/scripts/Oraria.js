import * as mc from "@minecraft/server";
import { PlayerStorage } from "./database/PlayerStorage.js";
import { PlayerManager } from "./core/PlayerManager.js";
import { HitboxSystem } from "./core/HitboxSystem.js";
import { Database } from "./database/Database.js";

export class Oraria {
	prefix = "[Oraria]";
	version = 0.1;

	// Managers
	static database;
	static playerManager;
	static hitboxSystem;
	static playerStorage;
	// #entityManager;
	// #effectEngine;
	// #commandManager;

	constructor(world) {
		Oraria.playerManager = new PlayerManager(world);
		Oraria.hitboxSystem = new HitboxSystem(world);
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
}
