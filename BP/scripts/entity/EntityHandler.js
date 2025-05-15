import * as mc from "@minecraft/server";
import { RPGPlayer } from "../character/RPGPlayer";
export class EntityHandler {
    constructor() {
        this.entities = new Set();
        this.workerId = null;
        this.tick = 0;
        this.TICK_INTERVAL = 1; // 1 tick = 1/20 sec
        this.ACTIVATION_RADIUS = 64; // Only tick entities within this range of a player
        this.startTicking();
    }
    registerEntity(entity) {
        this.entities.add(entity);
        // entity.onRegister?.();
    }
    unregisterEntity(entity) {
        this.entities.delete(entity);
        // entity.onUnregister?.();
    }
    startTicking() {
        if (this.workerId !== null)
            return; // already ticking
        this.workerId = mc.system.runInterval(() => {
            for (const entity of this.entities) {
                if (entity.shouldTick === false)
                    continue;
                // Optional: skip ticking if no nearby players
                if (entity instanceof RPGPlayer && !this.isEntityActive(entity))
                    continue;
                try {
                    entity.onTick(this.tick);
                }
                catch (err) {
                    console.warn(`[EntityHandler] Error ticking entity: ${err}`);
                }
            }
            this.tick++;
        }, this.TICK_INTERVAL);
    }
    stopTicking() {
        if (this.workerId !== null) {
            mc.system.clearRun(this.workerId);
            this.workerId = null;
        }
    }
    isEntityActive(entity) {
        const pos = entity.location;
        const players = entity.dimension.getPlayers({
            location: pos,
            maxDistance: this.ACTIVATION_RADIUS
        });
        for (const player of players) {
            if (player.isValid)
                return true;
        }
        return false;
    }
}
