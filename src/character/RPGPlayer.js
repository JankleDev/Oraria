import * as mc from "@minecraft/server";
import { Oraria } from "../Oraria.js";
import { Attributes } from "../entity/attribute/Attributes.js";

export class RPGPlayer {
	#player;
	initialized;
	attributes;

	constructor(player) {
		if (!player?.isValid) throw new Error("Invalid player entity");
		this.#player = player;
		this.initialized = false;

		this.attributes = new Attributes(this);
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
		Oraria.hitboxSystem.registerPlayer(this.#player);
		this.attributes.loadData(data.attributes);
		console.log(data);

		this.initialized = true;
	}

	emit(event) {
		world.sendMessage(`Event: ${event} from ${this.name}`);
		// Add custom event logic here
	}

	saveEverything() {
		// save economic data
		// save playtime data
		Oraria.playerStorage.saveAttributes(this);
		Oraria.playerStorage.savePlayer(this.id);
	}

	onLeave() {
		this.saveEverything();
		Oraria.hitboxSystem.removePlayer(this.#player);
	}
}
