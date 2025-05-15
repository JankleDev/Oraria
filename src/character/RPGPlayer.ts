import * as mc from "@minecraft/server";
import { Vector3 } from "@minecraft/server";
import { Oraria } from "../Oraria";
import { Entity } from "../entity/Entity";
import { HUDDisplay } from "./HUDDisplay";
import { Listener } from "../core/EventSystem";
import { HitboxSystem } from "../core/HitboxSystem";
import { Attributes } from "../entity/attribute/Attributes";
import { PlayerInteractEvent } from "../events/PlayerInteractEvent";

export class RPGPlayer extends Entity {
	readonly #player: mc.Player;
	initialized: boolean;
	attributes: Attributes;
	hud: HUDDisplay;

	private lastLeftClick: number;
	private rollTime: number | undefined;
	private rollCooldown: number | undefined;
	private startAction: number = -1;
	readonly ROLL_COOLDOWN: number = 5; // in ticks
	readonly ATTACK_COOLDOWN: number = 3;
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
		Listener.register(
			PlayerInteractEvent.NAME,
			(event: PlayerInteractEvent) => {
				const { player, viewDir, action } = event;
				const currentTick = mc.system.currentTick;

				// Only trigger if player recently left-clicked (within cooldown window)
				if (
					action === PlayerInteractEvent.LEFT_CLICK &&
					currentTick - this.lastLeftClick <= this.ATTACK_COOLDOWN
				) {
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

						const angle = calculateAngle(viewDir, directionToEntity);

						if (angle >= -45 && angle <= 45) {
							player.dimension.spawnParticle("minecraft:basic_flame_particle", entity.getHeadLocation());
						}
					}
				}

				this.lastLeftClick = currentTick;
			},
			{ priority: 100 }
		);
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

		if (currentTick % 20 === 0) {
			const maxStamina = this.attributes.maxStamina;
			const maxMana = this.attributes.maxMana;

			this.attributes.restoreStamina(Math.floor(maxStamina * 0.2));
			this.attributes.restoreMana(Math.floor(maxMana * 0.07));
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
