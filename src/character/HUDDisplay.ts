import { system, Player } from "@minecraft/server";

export class HUDDisplay {
	private player: Player;
	private inputHistory: string[] = [];

	private cachedHealth: number = -1;
	private cachedMana: number = -1;
	private cachedStamina: number = -1;

	constructor(player: Player) {
		this.player = player;
	}

	pushInput(input: "L" | "R"): void {
		if (this.inputHistory.length === 3) {
			// Reset once combo is full
			this.inputHistory = [];
		}

		this.inputHistory.push(input);
		system.run(() => {
			this.displayHUD();
		});
	}

	update({
		health,
		maxHealth,
		mana,
		maxMana,
		stamina,
		maxStamina
	}: {
		health?: number;
		maxHealth?: number;
		mana?: number;
		maxMana?: number;
		stamina?: number;
		maxStamina?: number;
	}): void {
		const healthPercent =
			health !== undefined && maxHealth !== undefined
				? Math.round((health / maxHealth) * 100)
				: this.cachedHealth;

		const manaPercent =
			mana !== undefined && maxMana !== undefined ? Math.round((mana / maxMana) * 100) : this.cachedMana;

		const staminaPercent =
			stamina !== undefined && maxStamina !== undefined
				? Math.round((stamina / maxStamina) * 100)
				: this.cachedStamina;

		if (
			healthPercent === this.cachedHealth &&
			manaPercent === this.cachedMana &&
			staminaPercent === this.cachedStamina
		)
			return;

		this.cachedHealth = healthPercent;
		this.cachedMana = manaPercent;
		this.cachedStamina = staminaPercent;

		this.displayHUD();
	}

	private displayHUD(): void {
		const title = `updateHUD:${this.cachedHealth}, ${this.cachedMana}, ${this.cachedStamina}`;

		// Fill remaining slots with '?'
		const padded = [...this.inputHistory];
		while (padded.length < 3) padded.push("?");

		const subtitle = "§a" + padded.join(" - ");

		this.player.onScreenDisplay.setTitle(title, {
			stayDuration: 4,
			fadeInDuration: 2,
			fadeOutDuration: 1,
			subtitle
		});
	}
}
