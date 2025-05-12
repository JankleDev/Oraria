var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _a, _HitboxSystem_connectors, _HitboxSystem_hitboxes;
import { world } from "@minecraft/server";
import { Errors } from "../util/Errors.js";
export class HitboxSystem {
    constructor() {
        world.afterEvents.entityDie.subscribe(({ deadEntity }) => {
            for (const [playerId, connector] of __classPrivateFieldGet(_a, _a, "f", _HitboxSystem_connectors).entries()) {
                if (connector.id === deadEntity.id) {
                    const player = world.getEntity(playerId);
                    if (player?.isValid) {
                        _a.removePlayer(player);
                        _a.registerPlayer(player);
                    }
                    return;
                }
            }
            for (const [playerId, hitbox] of __classPrivateFieldGet(_a, _a, "f", _HitboxSystem_hitboxes).entries()) {
                if (hitbox.id === deadEntity.id) {
                    const player = world.getEntity(playerId);
                    if (player?.isValid) {
                        _a.removePlayer(player);
                        _a.registerPlayer(player);
                    }
                    return;
                }
            }
        });
    }
    static registerPlayer(player) {
        const { dimension, location } = player;
        const connector = dimension.spawnEntity(_a.HITBOX_CONNECTOR_TYPE_ID, location);
        const hitbox = dimension.spawnEntity(_a.HITBOX_TYPE_ID, location);
        const playerRideable = player.getComponent("rideable");
        const connectorRideable = connector?.getComponent("rideable");
        if (playerRideable && connectorRideable) {
            playerRideable.addRider(connector);
            connectorRideable.addRider(hitbox);
            __classPrivateFieldGet(this, _a, "f", _HitboxSystem_connectors).set(player.id, connector);
            __classPrivateFieldGet(this, _a, "f", _HitboxSystem_hitboxes).set(player.id, hitbox);
        }
        else {
            console.warn(`Rideable component missing when registering hitbox for player ${player.name}`);
        }
    }
    static validatePlayer(player, registerIfMissing = true) {
        const hitbox = __classPrivateFieldGet(this, _a, "f", _HitboxSystem_hitboxes).get(player.id);
        const connector = __classPrivateFieldGet(this, _a, "f", _HitboxSystem_connectors).get(player.id);
        if (!hitbox || !connector) {
            if (registerIfMissing) {
                this.registerPlayer(player);
            }
            console.warn(Errors.VALIDATION_FAILED);
        }
    }
    static removePlayer(player) {
        const hitbox = __classPrivateFieldGet(this, _a, "f", _HitboxSystem_hitboxes).get(player.id);
        const connector = __classPrivateFieldGet(this, _a, "f", _HitboxSystem_connectors).get(player.id);
        hitbox?.remove();
        connector?.remove();
        __classPrivateFieldGet(this, _a, "f", _HitboxSystem_connectors).delete(player.id);
        __classPrivateFieldGet(this, _a, "f", _HitboxSystem_hitboxes).delete(player.id);
    }
    static removeAll() {
        for (const player of world.getPlayers()) {
            this.removePlayer(player);
        }
    }
}
_a = HitboxSystem;
HitboxSystem.HITBOX_TYPE_ID = "oraria:hitbox";
HitboxSystem.HITBOX_CONNECTOR_TYPE_ID = "oraria:hitbox_connector";
_HitboxSystem_connectors = { value: new Map() };
_HitboxSystem_hitboxes = { value: new Map() };
