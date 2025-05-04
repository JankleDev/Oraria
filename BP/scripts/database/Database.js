import { world } from "@minecraft/server";
import { ChunkedStorage } from "./ChunkedStorage.js";
import { PlayerStorage } from "./PlayerStorage.js";

export class Database {
	constructor() {

		// Player data storage system
		this.playerStorage = new PlayerStorage();

		// Economy system
		// this.economy = new EconomySystem(this.worldStorage);

		// World data system
		// this.worldData = new WorldDataSystem(this.worldStorage);
	}

	// Save all data to world properties
	saveAll() {
		this.playerStorage.saveAll();
		// this.worldData.save();
	}
}

// Helper class for chunked storage
