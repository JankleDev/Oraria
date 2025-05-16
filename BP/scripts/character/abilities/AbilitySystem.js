export class Ability {
    constructor(id, cooldown) {
        this.lastUsed = 0;
        this.id = id;
        this.cooldown = cooldown;
    }
    canUse(ctx) {
        return ctx.tick - this.lastUsed >= this.cooldown;
    }
    use(ctx) {
        if (!this.canUse(ctx))
            return;
        this.lastUsed = ctx.tick;
        this.activate(ctx);
    }
}
export class AbilityRegistry {
    static register(ability) {
        this.abilities.set(ability.id, ability);
    }
    static get(id) {
        return this.abilities.get(id);
    }
    static getAll() {
        return Array.from(this.abilities.values());
    }
}
AbilityRegistry.abilities = new Map();
export class ComboAbilityManager {
    static bindCombo(combo, abilityId) {
        this.comboAbilities.set(combo, abilityId);
    }
    static handleInput(player, input, tick) {
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
ComboAbilityManager.comboAbilities = new Map();
export class InputTracker {
    static pushInput(player, input, tick) {
        const id = player.id;
        const log = this.inputLogs.get(id) ?? { inputs: [], lastTick: 0 };
        if (tick - log.lastTick > this.inputWindow)
            log.inputs = [];
        log.inputs.push(input);
        log.lastTick = tick;
        this.inputLogs.set(id, log);
    }
    static getCombo(player) {
        return this.inputLogs.get(player.id)?.inputs.join("-") ?? "";
    }
    static reset(player) {
        this.inputLogs.delete(player.id);
    }
}
InputTracker.combos = new Map();
InputTracker.inputWindow = 20; // ticks
InputTracker.inputLogs = new Map();
