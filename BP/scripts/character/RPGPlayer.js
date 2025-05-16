var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _RPGPlayer_player;
import * as mc from "@minecraft/server";
import { Oraria } from "../Oraria";
import { Vec3 } from "../math/Vector3";
import { Entity } from "../entity/Entity";
import { HUDDisplay } from "./HUDDisplay";
import { Listener } from "../core/EventSystem";
import { HitboxSystem } from "../core/HitboxSystem";
import { PlayerInteractEvent } from "../events/PlayerInteractEvent";
import { ComboAbilityManager } from "./abilities/AbilitySystem";
export class RPGPlayer extends Entity {
    constructor(player) {
        super(player);
        _RPGPlayer_player.set(this, void 0);
        this.abilities = new Map();
        this.startAction = -1;
        this.ROLL_COOLDOWN = 5; // in ticks
        this.ATTACK_COOLDOWN = 3;
        this.shouldTick = true;
        if (!player?.isValid)
            throw new Error("Invalid player entity");
        __classPrivateFieldSet(this, _RPGPlayer_player, player, "f");
        this.initialized = false;
        this.hud = new HUDDisplay(player);
        HitboxSystem.registerPlayer(__classPrivateFieldGet(this, _RPGPlayer_player, "f"));
    }
    get id() {
        return __classPrivateFieldGet(this, _RPGPlayer_player, "f").id;
    }
    get name() {
        return __classPrivateFieldGet(this, _RPGPlayer_player, "f").name;
    }
    get location() {
        return __classPrivateFieldGet(this, _RPGPlayer_player, "f").location;
    }
    sendMessage(message) {
        __classPrivateFieldGet(this, _RPGPlayer_player, "f").sendMessage(message);
    }
    initEntity(data) {
        this.attributes.load(data.attributes);
        //	this.attributes.recalculate(true);
        // Update hud for the first time to mark it visible
        this.hud.update({
            health: this.attributes.health,
            maxHealth: this.attributes.maxHealth,
            mana: this.attributes.mana,
            maxMana: this.attributes.maxMana,
            stamina: this.attributes.stamina,
            maxStamina: this.attributes.maxStamina
        });
        // Register listener for detecting clicks
        Listener.register(PlayerInteractEvent.NAME, (event) => {
            this.handleClicks(event);
        }, { priority: 100 });
    }
    handleClicks(event) {
        const { player, viewDir, action } = event;
        const currentTick = mc.system.currentTick;
        if (action === PlayerInteractEvent.LEFT_CLICK) {
            if (currentTick - this.lastLeftClick <= this.ATTACK_COOLDOWN) {
                this.sweep(player, viewDir);
            }
            this.lastLeftClick = currentTick;
            ComboAbilityManager.handleInput(player, "L", currentTick);
            this.hud.pushInput("L");
        }
        else if (action === PlayerInteractEvent.RIGHT_CLICK) {
            ComboAbilityManager.handleInput(player, "R", currentTick);
            this.hud.pushInput("R");
        }
    }
    sweep(player, viewDir) {
        const origin = player.location;
        const nearbyEntities = player.dimension.getEntities({
            location: origin,
            maxDistance: 6
        });
        for (const entity of nearbyEntities) {
            const directionToEntity = {
                x: entity.location.x - origin.x,
                y: entity.location.y - origin.y,
                z: entity.location.z - origin.z
            };
            const angle = Vec3.angle(viewDir, directionToEntity);
            if (angle >= -45 && angle <= 45) {
                player.dimension.spawnParticle("minecraft:basic_flame_particle", entity.getHeadLocation());
            }
        }
    }
    onTick(currentTick) {
        if (__classPrivateFieldGet(this, _RPGPlayer_player, "f").isSneaking) {
            if (this.rollTime === undefined || this.rollTime === -1) {
                this.rollTime = currentTick;
            }
        }
        else {
            if (this.rollTime !== undefined && this.rollTime !== -1) {
                const sneakedFor = currentTick - this.rollTime;
                if (sneakedFor <= 5) {
                    if (!this.isUsingItem()) {
                        this.sendMessage("roll performed");
                        // TODO: Execute roll logic here
                        this.rollCooldown = currentTick + this.ROLL_COOLDOWN;
                    }
                }
                this.rollTime = -1; // reset
            }
        }
        if (currentTick % 20 === 0) {
            const maxStamina = this.attributes.maxStamina;
            const maxMana = this.attributes.maxMana;
            this.attributes.restoreStamina(Math.floor(maxStamina * 0.2));
            this.attributes.restoreMana(Math.floor(maxMana * 0.07));
        }
    }
    addAbility(ability) {
        this.abilities.set(ability.id, ability);
    }
    useAbility(id, ctx) {
        this.abilities.get(id)?.use(ctx);
    }
    isUsingItem() {
        return this.startAction > -1;
    }
    setUsingItem(value) {
        this.startAction = value ? mc.system.currentTick : -1;
    }
    getItemUseDuration() {
        return this.startAction === -1 ? -1 : mc.system.currentTick - this.startAction;
    }
    saveEverything() {
        Oraria.playerStorage.saveAttributes(this);
        Oraria.playerStorage.savePlayer(this.id);
    }
    onLeave() {
        this.saveEverything();
        HitboxSystem.removePlayer(__classPrivateFieldGet(this, _RPGPlayer_player, "f"));
    }
}
_RPGPlayer_player = new WeakMap();
