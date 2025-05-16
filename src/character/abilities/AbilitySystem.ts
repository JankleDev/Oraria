import { Player } from "@minecraft/server";

export interface AbilityContext {
	player: Player;
	tick: number;
	combo?: string;
}

export abstract class Ability {
	id: string;
	cooldown: number;
	lastUsed: number = 0;

	constructor(id: string, cooldown: number) {
		this.id = id;
		this.cooldown = cooldown;
	}

	canUse(ctx: AbilityContext): boolean {
		return ctx.tick - this.lastUsed >= this.cooldown;
	}

	use(ctx: AbilityContext): void {
		if (!this.canUse(ctx)) return;
		this.lastUsed = ctx.tick;
		this.activate(ctx);
	}

	abstract activate(ctx: AbilityContext): void;
}

export class AbilityRegistry {
	private static abilities = new Map<string, Ability>();

	static register(ability: Ability) {
		this.abilities.set(ability.id, ability);
	}

	static get(id: string) {
		return this.abilities.get(id);
	}

	static getAll() {
		return Array.from(this.abilities.values());
	}
}

export class ComboAbilityManager {
	private static comboAbilities = new Map<string, string>();

	static bindCombo(combo: string, abilityId: string) {
		this.comboAbilities.set(combo, abilityId);
	}

	static handleInput(player: Player, input: string, tick: number) {
		InputTracker.pushInput(player, input, tick);
		const combo = InputTracker.getCombo(player);

		const abilityId = this.comboAbilities.get(combo);
		if (abilityId) {
			const ability = AbilityRegistry.get(abilityId);
			ability?.use({ player, tick, combo });
			InputTracker.reset(player);
		}
	}
}

export class InputTracker {
	private static combos = new Map<string, string[]>();
	private static inputWindow = 20; // ticks
	private static inputLogs = new Map<string, { inputs: string[]; lastTick: number }>();

	static pushInput(player: Player, input: string, tick: number) {
		const id = player.id;
		const log = this.inputLogs.get(id) ?? { inputs: [], lastTick: 0 };

		if (tick - log.lastTick > this.inputWindow) log.inputs = [];

		log.inputs.push(input);
		log.lastTick = tick;

		this.inputLogs.set(id, log);
	}

	static getCombo(player: Player): string {
		return this.inputLogs.get(player.id)?.inputs.join("-") ?? "";
	}

	static reset(player: Player) {
		this.inputLogs.delete(player.id);
	}
}
