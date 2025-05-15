import * as mc from "@minecraft/server";
import { Entity } from "./Entity";
import { RPGPlayer } from "../character/RPGPlayer";

export class EntityHandler {
	private entities: Set<Entity> = new Set();
	private workerId: number | null = null;
	private tick: number = 0;
	private readonly TICK_INTERVAL = 1; // 1 tick = 1/20 sec
	private readonly ACTIVATION_RADIUS = 64; // Only tick entities within this range of a player

	constructor() {
		this.startTicking();
	}

	registerEntity(entity: Entity): void {
		this.entities.add(entity);
		// entity.onRegister?.();
	}

	unregisterEntity(entity: Entity): void {
		this.entities.delete(entity);
		// entity.onUnregister?.();
	}

	startTicking(): void {
		if (this.workerId !== null) return; // already ticking

		this.workerId = mc.system.runInterval(() => {
			for (const entity of this.entities) {
				if (entity.shouldTick === false) continue;

				// Optional: skip ticking if no nearby players

				if (entity instanceof RPGPlayer && !this.isEntityActive(entity)) continue;

				try {
					entity.onTick(this.tick);
				} catch (err) {
					console.warn(`[EntityHandler] Error ticking entity: ${err}`);
				}
			}

			this.tick++;
		}, this.TICK_INTERVAL);
	}

	stopTicking(): void {
		if (this.workerId !== null) {
			mc.system.clearRun(this.workerId);
			this.workerId = null;
		}
	}

	private isEntityActive(entity: Entity): boolean {
		const pos = entity.location;
		const players = entity.dimension.getPlayers({
			location: pos,
			maxDistance: this.ACTIVATION_RADIUS
		});
		for (const player of players) {
			if (player.isValid) return true;
		}
		return false;
	}
}
