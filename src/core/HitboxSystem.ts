import { world, Entity, Player } from "@minecraft/server";
import { Errors } from "../util/Errors.js";

export class HitboxSystem {
	static readonly HITBOX_TYPE_ID = "oraria:hitbox";
	static readonly HITBOX_CONNECTOR_TYPE_ID = "oraria:hitbox_connector";

	static #connectors = new Map<string, Entity>();
	static #hitboxes = new Map<string, Entity>();

	constructor() {
		world.afterEvents.entityDie.subscribe(({ deadEntity }) => {
			for (const [playerId, connector] of HitboxSystem.#connectors.entries()) {
				if (connector.id === deadEntity.id) {
					const player = world.getEntity(playerId) as Player;
					if (player?.isValid) {
						HitboxSystem.removePlayer(player);
						HitboxSystem.registerPlayer(player);
					}
					return;
				}
			}

			for (const [playerId, hitbox] of HitboxSystem.#hitboxes.entries()) {
				if (hitbox.id === deadEntity.id) {
					const player = world.getEntity(playerId) as Player;
					if (player?.isValid) {
						HitboxSystem.removePlayer(player);
						HitboxSystem.registerPlayer(player);
					}
					return;
				}
			}
		});
	}

	static registerPlayer(player: Player): void {
		const { dimension, location } = player;

		const connector = dimension.spawnEntity(HitboxSystem.HITBOX_CONNECTOR_TYPE_ID as any, location);
		const hitbox = dimension.spawnEntity(HitboxSystem.HITBOX_TYPE_ID as any, location);

		const playerRideable = player.getComponent("rideable");
		const connectorRideable = connector?.getComponent("rideable");

		if (playerRideable && connectorRideable) {
			playerRideable.addRider(connector);
			connectorRideable.addRider(hitbox);

			this.#connectors.set(player.id, connector);
			this.#hitboxes.set(player.id, hitbox);
		} else {
			console.warn(`Rideable component missing when registering hitbox for player ${player.name}`);
		}
	}

	static validatePlayer(player: Player, registerIfMissing = true): void {
		const hitbox = this.#hitboxes.get(player.id);
		const connector = this.#connectors.get(player.id);

		if (!hitbox || !connector) {
			if (registerIfMissing) {
				this.registerPlayer(player);
			}
			console.warn(Errors.VALIDATION_FAILED);
		}
	}

	static removePlayer(player: Player): void {
		const hitbox = this.#hitboxes.get(player.id);
		const connector = this.#connectors.get(player.id);

		hitbox?.remove();
		connector?.remove();

		this.#connectors.delete(player.id);
		this.#hitboxes.delete(player.id);
	}

	static removeAll(): void {
		for (const player of world.getPlayers()) {
			this.removePlayer(player);
		}
	}
}
