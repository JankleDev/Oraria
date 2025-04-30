import { world, Player } from "@minecraft/server";
import { RPGPlayer } from "../character/RPGPlayer.js";
import { LError } from "../util/LError.js";
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
				console.error(`Failed to init player ${player.name}: ${error}`);
			}
		});

		world.beforeEvents.playerLeave.subscribe(({ playerId }) => {
			const player = this.get(playerId);
			player?.onLeave();
			this.#players.delete(playerId);
		});
	}

	static get(playerRef) {
		if (typeof playerRef === "string") {
			// Find by name or ID
			return [...this.#players.values()].find((p) => p.name === playerRef || p.id === playerRef) ?? null;
		} else if (playerRef?.id) {
			// Get by Player object
			return this.#players.get(playerRef.id) ?? null;
		}
		return LError.FAILED_PLAYER_REF_SEARCH;
	}

	static getAll() {
		return Array.from(this.#players.values());
	}
}
