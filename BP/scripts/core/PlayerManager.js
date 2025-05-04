import { world, Player } from "@minecraft/server";
import { RPGPlayer } from "../character/RPGPlayer.js";
import { Errors } from "../util/Errors.js";
import { Oraria } from "../Oraria.js";

export class PlayerManager {
	static #players = new Map();

	static {
		world.afterEvents.playerSpawn.subscribe((eventData) => {
			const { player, initialSpawn } = eventData;
			if (!initialSpawn) return;
			try {
				const rpgPlayer = new RPGPlayer(player);
				this.#players.set(player.id, rpgPlayer);
				const data = Oraria.playerStorage.getPlayerData(rpgPlayer, true);
				rpgPlayer.initEntity(data);
			} catch (error) {
				console.warn(`Failed to init player ${player.name}: ${error}`);
			}
		});

		world.beforeEvents.playerLeave.subscribe(({ playerId }) => {
			const player = this.get(playerId);
			console.log("onLeave from PlayerManager.js: ", JSON.stringify(player, null, 2));
			player?.onLeave();
			this.#players.delete(playerId);
		});
	}

	static get(playerRef) {
		if (typeof playerRef === "string") {
			// Find by name or ID
			// Work around hack, need to change this so we get player object by world.getEntities(name) and then get their .id to fetch from this table, should be faster than running through this array of rpgPlayers.
			return [...this.#players.values()].find((p) => p.name === playerRef || p.id === playerRef) ?? null;
		} else if (playerRef?.id) {
			// Get by Player object
			return this.#players.get(playerRef.id) ?? null;
		}
		return Errors.FAILED_PLAYER_REF_SEARCH;
	}

	static getAll() {
		return Array.from(this.#players.values());
	}
}
