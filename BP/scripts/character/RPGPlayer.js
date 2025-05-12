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
import { HUDDisplay } from "./HUDDisplay";
import { Entity } from "../entity/Entity";
import { HitboxSystem } from "../core/HitboxSystem";
export class RPGPlayer extends Entity {
    constructor(player) {
        super(player);
        _RPGPlayer_player.set(this, void 0);
        this.ROLL_COOLDOWN = 15; // in ticks
        this.startAction = -1;
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
        this.attributes.loadData(data.attributes);
        // Update hud for the first time to mark it visible
        this.hud.update({
            health: this.attributes.health,
            maxHealth: this.attributes.maxHealth,
            mana: this.attributes.mana,
            maxMana: this.attributes.maxMana,
            stamina: this.attributes.stamina,
            maxStamina: this.attributes.maxStamina
        });
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
        if (currentTick % 5 === 0) {
            const data = {
                health: this.attributes.health,
                maxHealth: this.attributes.maxHealth,
                mana: this.attributes.mana,
                maxMana: this.attributes.maxMana,
                stamina: this.attributes.stamina,
                maxStamina: this.attributes.maxStamina
            };
            this.hud.update({
                health: this.attributes.health,
                maxHealth: this.attributes.maxHealth,
                mana: this.attributes.mana,
                maxMana: this.attributes.maxMana,
                stamina: this.attributes.stamina,
                maxStamina: this.attributes.maxStamina
            });
            console.log(JSON.stringify(data, null, 2));
        }
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
