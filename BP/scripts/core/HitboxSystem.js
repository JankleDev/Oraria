import { world, system, Entity } from "@minecraft/server";
import { Errors } from "../util/Errors.js";

export class HitboxSystem {
	static HITBOX_TYPE_ID = "oraria:hitbox";
	static HITBOX_CONNECTOR_TYPE_ID = "oraria:hitbox_connector";

	static #connectors = new Map();
	static #hitboxes = new Map();

	constructor(world) {
		// Check if any hitbox/connector entity died, should not be possible but its a fallback
		world.afterEvents.entityDie.subscribe(({ deadEntity, damageSource }) => {
			// dirty hack and not optimized.
			for (const [playerId, connector] of HitboxSystem.#connectors) {
				if (connector.id === deadEntity.id) {
					const player = world.getEntity(playerId);
					HitboxSystem.removePlayer(player);
					HitboxSystem.registerPlayer(player);
					return;
				}
			}

			// Check hitboxes map
			for (const [playerId, hitbox] of HitboxSystem.#hitboxes) {
				if (hitbox.id === deadEntity.id) {
					const player = world.getEntity(playerId);
					HitboxSystem.removePlayer(player);
					HitboxSystem.registerPlayer(player);
					return;
				}
			}
		});

		/*world.beforeEvents.playerLeave.subscribe(({ player }) => {
			HitboxSystem.removePlayer(player);
		});*/

		// Remove All entity before shutdown
		/*world.beforeEvents.worldUnload.subscribe(() => {
			HitboxSystem.removeAll();
		});*/
	}

	static registerPlayer(player) {
		const connector = player.dimension.spawnEntity(HitboxSystem.HITBOX_CONNECTOR_TYPE_ID, player.location);
		const hitbox = player.dimension.spawnEntity(HitboxSystem.HITBOX_TYPE_ID, player.location);

		// Make connector ride player
		const rideablePlayer = player.getComponent("rideable");
		rideablePlayer.addRider(connector);
		// Make hitbox ride connector
		const rideableConnector = connector.getComponent("rideable");
		rideableConnector.addRider(hitbox);

		HitboxSystem.#connectors.set(player.id, connector);
		HitboxSystem.#hitboxes.set(player.id, hitbox);
	}

	static validatePlayer(player, registerIfMissing = true) {
		const hitbox = HitboxSystem.#hitboxes.get(player.id) ?? undefined;
		const connector = HitboxSystem.#connectors.get(player.id) ?? undefined;

		if (hitbox === undefined || connector === undefined) {
			if (registerIfMissing === true) {
				this.registerPlayer(player);
			}
			return Errors.VALIDATION_FALIED;
		}
	}

	static removePlayer(player) {
		const hitbox = HitboxSystem.#hitboxes.get(player.id);
		const connector = HitboxSystem.#connectors.get(player.id);

		hitbox.remove();
		connector.remove();

		HitboxSystem.#connectors.delete(player.id);
		HitboxSystem.#hitboxes.delete(player.id);
	}

	static removeAll(world) {
		for (let player in world.getAllPlayers()) {
			HitboxSystem.removePlayer(player);
		}
	}
}
