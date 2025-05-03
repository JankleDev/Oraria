import { Errors } from "../util/Errors.js";

export class HUDDisplay {
	static = {
		HEALTH_PRESET_1: "health1:",
		STAMINA_PRESET_1: "stamina1:",
		FOCUS_PRESET_1: "focus1:"
	};

	player;
	cache = {
		health: -1,
		stamina: -1,
		focus: -1
	};

	constructor(player) {
		this.player = player;
	}

	/*
	 * data{health: int, stamina: int, focus: int}
	 */
	load(data) {
		try {
			this.cache = {
				health: data.health,
				stamina: data.stamina,
				focus: data.focus
			};
		} catch (err) {
			console.warn(Errors.PLAYER_HUD_LOAD_FALIED);
		}
	}

	/*  convert values to percentage then pass it to json ui, title should look like `playerHud: health, stamina, focus`*/
	update(health = -1, stamina = -1, focus = -1) {
		if (health === -1) {
			if (this.cache.health >= 0) {
				health = this.cache.health;
			}
		}
		this.player.onScreenDisplay.setTitle(title, {
			stayDuration: 1,
			fadeInDuration: 0,
			fadeOutDuration: 0,
			subtitle: ""
		});
	}
}
