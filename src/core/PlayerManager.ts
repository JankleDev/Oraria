import { world, Player } from "@minecraft/server";
import { RPGPlayer } from "../character/RPGPlayer";
import { Errors } from "../util/Errors";
import { Oraria } from "../Oraria";

export class PlayerManager {
	private static players: Map<string, RPGPlayer> = new Map();

	static {
		world.afterEvents.playerSpawn.subscribe(async (eventData) => {
			const { player, initialSpawn } = eventData;
			if (!initialSpawn) return;
			try {
				const rpgPlayer = new RPGPlayer(player);
				const data = await Oraria.playerStorage.getPlayerData(rpgPlayer, true);
				rpgPlayer.initEntity(data);
				Oraria.entityHandler.registerEntity(rpgPlayer);
				this.players.set(player.id, rpgPlayer);
			} catch (error) {
				console.warn(`Failed to init player ${player.name}: ${error}`);
			}
		});

		world.beforeEvents.playerLeave.subscribe((eventData) => {
			const playerId = eventData.player.id;
			const rpgPlayer = this.get(playerId);
			rpgPlayer?.onLeave();
			this.players.delete(playerId);
		});
	}

	/**
	 * Gets an RPGPlayer by reference (Player object or player ID)
	 * @param playerRef Player object or player ID
	 * @returns RPGPlayer or null if not found, or error if invalid reference
	 */
	static get(playerRef: Player | string): RPGPlayer | null {
		if (typeof playerRef === "string") {
			// Get by player ID
			return this.players.get(playerRef) ?? null;
		} else if (playerRef?.id) {
			// Get by Player object
			return this.players.get(playerRef.id) ?? null;
		}
		console.warn(Errors.FAILED_PLAYER_REF_SEARCH + JSON.stringify(playerRef, null, 2));
		return null;
	}

	/**
	 * Gets all RPGPlayers
	 * @returns Array of all RPGPlayers
	 */
	static getAll(): RPGPlayer[] {
		return Array.from(this.players.values());
	}
}
