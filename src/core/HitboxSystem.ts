import { system, world, Entity, Player, EntityEventOptions } from "@minecraft/server";
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
		world.afterEvents.entityLoad.subscribe((event) => {
			const entity = event.entity;
			if (
				entity.typeId === HitboxSystem.HITBOX_CONNECTOR_TYPE_ID ||
				entity.typeId === HitboxSystem.HITBOX_TYPE_ID
			) {
				const entityRiding = entity.getComponent("riding");
				if (!entityRiding) {
					system.run(() => {
						entity?.remove();
					});
				}
			}
		});
		world.afterEvents.entityHitEntity.subscribe((event) => {
			const { damagingEntity, hitEntity } = event;
			if (
				hitEntity.typeId === HitboxSystem.HITBOX_TYPE_ID ||
				hitEntity.typeId === HitboxSystem.HITBOX_CONNECTOR_TYPE_ID
			) {
				if (damagingEntity instanceof Player) console.warn(`leftClick detect from: ${damagingEntity.name}`);
			}
		});
		world.beforeEvents.playerInteractWithEntity.subscribe((event) => {
			const { player, target } = event;
			if (
				target.typeId === HitboxSystem.HITBOX_TYPE_ID ||
				target.typeId === HitboxSystem.HITBOX_CONNECTOR_TYPE_ID
			) {
				console.warn(`rightClick detect from: ${player.name}`);
			}
		});
	}

	static registerPlayer(player: Player): void {
		const { dimension, location } = player;

		const connector = dimension.spawnEntity<string>(HitboxSystem.HITBOX_CONNECTOR_TYPE_ID, location);
		if (!connector) return;

		const hitbox = dimension.spawnEntity<string>(HitboxSystem.HITBOX_TYPE_ID, location);
		if (!hitbox) return;

		const playerRideable = player.getComponent("rideable");
		const connectorRideable = connector.getComponent("rideable");

		if (playerRideable && connectorRideable) {
			system.runTimeout(() => {
				playerRideable.addRider(connector);
			}, 3);
			system.runTimeout(() => {
				connectorRideable.addRider(hitbox);
			}, 8);

			this.#connectors.set(player.id, connector);
			this.#hitboxes.set(player.id, hitbox);
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
		system.run(() => {
			hitbox?.remove();
			connector?.remove();
		});
		this.#connectors.delete(player.id);
		this.#hitboxes.delete(player.id);
	}

	static removeAll(): void {
		for (const player of world.getPlayers()) {
			this.removePlayer(player);
		}
	}
}
