import * as mc from "@minecraft/server";
import { Oraria } from "../Oraria.js";
import { HUDDisplay } from "./HUDDisplay.js";
import { Attributes } from "../entity/attribute/Attributes.js";

export class RPGPlayer {
	#player;
	initialized;
	attributes;
	screenDisplay;

	constructor(player) {
		if (!player?.isValid) throw new Error("Invalid player entity");
		this.#player = player;
		this.initialized = false;

		this.attributes = new Attributes(this);
		this.screenDisplay = new HUDDisplay(player);
	}

	get id() {
		return this.#player.id;
	}
	get name() {
		return this.#player.name;
	}
	get location() {
		return this.#player.location;
	}

	initEntity(data) {
		HitboxSystem.removePlayer(this.#player);
		this.attributes.loadData(data.attributes);

		this.initialized = true;
	}

	saveEverything() {
		// save economic data
		// save playtime data
		Oraria.playerStorage.saveAttributes(this);
		Oraria.playerStorage.savePlayer(this.id);
	}

	onLeave() {
		this.saveEverything();
		HitboxSystem.removePlayer(this.#player);
	}
}
