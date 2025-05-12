import * as mc from "@minecraft/server";
import { Vector3 } from "@minecraft/server";
import { Oraria } from "../Oraria";
import { HUDDisplay } from "./HUDDisplay";
import { Entity } from "../entity/Entity";
import { Attributes } from "../entity/attribute/Attributes";
import { HitboxSystem } from "../core/HitboxSystem";

export class RPGPlayer extends Entity {
	readonly #player: mc.Player;
	initialized: boolean;
	attributes: Attributes;
	hud: HUDDisplay;
	rollTime: number | undefined;
	rollCooldown: number | undefined;
	readonly ROLL_COOLDOWN: number = 15; // in ticks
	private startAction: number = -1;
	public shouldTick: boolean = true;

	constructor(player: mc.Player) {
		super(player);
		if (!player?.isValid) throw new Error("Invalid player entity");
		this.#player = player;
		this.initialized = false;

		this.hud = new HUDDisplay(player);
		HitboxSystem.registerPlayer(this.#player);
	}

	get id(): string {
		return this.#player.id;
	}

	get name(): string {
		return this.#player.name;
	}

	get location(): mc.Vector3 {
		return this.#player.location;
	}

	sendMessage(message: string): void {
		this.#player.sendMessage(message);
	}

	initEntity(data: { attributes: object }): void {
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

	onTick(currentTick: number): void {
		if (this.#player.isSneaking) {
			if (this.rollTime === undefined || this.rollTime === -1) {
				this.rollTime = currentTick;
			}
		} else {
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

	isUsingItem(): boolean {
		return this.startAction > -1;
	}

	setUsingItem(value: boolean): void {
		this.startAction = value ? mc.system.currentTick : -1;
	}

	getItemUseDuration(): number {
		return this.startAction === -1 ? -1 : mc.system.currentTick - this.startAction;
	}

	saveEverything(): void {
		Oraria.playerStorage.saveAttributes(this);
		Oraria.playerStorage.savePlayer(this.id);
	}

	onLeave(): void {
		this.saveEverything();
		HitboxSystem.removePlayer(this.#player);
	}
}
