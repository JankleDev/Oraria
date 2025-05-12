export class Attributes {
    constructor(entity) {
        this.entity = entity;
        // Initialize base attributes with default values
        this._baseAttributes = {
            vitality: 10,
            endurance: 10,
            strength: 10,
            dexterity: 10,
            intelligence: 10,
            faith: 10,
            arcane: 10
        };
        // Initialize resources
        this._currentResources = {
            health: 0,
            stamina: 0,
            mana: 0,
            focus: 0
        };
        this._maxResources = {
            health: 0,
            stamina: 0,
            mana: 0,
            focus: 0
        };
        // Calculate initial stats
        this.updateAllStats();
    }
    // --- Attributes Management ---
    get baseAttributes() {
        return { ...this._baseAttributes };
    }
    get effectiveAttributes() {
        return this.calculateEffectiveAttributes();
    }
    increaseAttribute(attribute, amount = 1) {
        if (this._baseAttributes[attribute] !== undefined) {
            this._baseAttributes[attribute] += amount;
            this.updateAllStats();
            return true;
        }
        return false;
    }
    calculateEffectiveAttributes() {
        const effective = {};
        Object.keys(this._baseAttributes).forEach((attr) => {
            const value = this._baseAttributes[attr];
            const caps = Attributes.SOFT_CAPS[attr];
            effective[attr] =
                value > caps.hard
                    ? caps.hard + (value - caps.hard) * 0.2
                    : value > caps.soft
                        ? caps.soft + (value - caps.soft) * 0.5
                        : value;
        });
        return effective;
    }
    // --- Resource Accessors ---
    get health() {
        return this._currentResources.health;
    }
    get maxHealth() {
        return this._maxResources.health;
    }
    get stamina() {
        return this._currentResources.stamina;
    }
    get maxStamina() {
        return this._maxResources.stamina;
    }
    get mana() {
        return this._currentResources.mana;
    }
    get maxMana() {
        return this._maxResources.mana;
    }
    get focus() {
        return this._currentResources.focus;
    }
    get maxFocus() {
        return this._maxResources.focus;
    }
    // --- Resource Manipulation ---
    reduceHealth(amount) {
        this._currentResources.health = Math.max(0, this.health - amount);
        return this.health;
    }
    reduceStamina(amount) {
        this._currentResources.stamina = Math.max(0, this.stamina - amount);
        return this.stamina;
    }
    reduceMana(amount) {
        this._currentResources.mana = Math.max(0, this.mana - amount);
        return this.mana;
    }
    reduceFocus(amount) {
        this._currentResources.focus = Math.max(0, this.focus - amount);
        return this.focus;
    }
    restoreHealth(amount) {
        this._currentResources.health = Math.min(this.maxHealth, this.health + amount);
        return this.health;
    }
    restoreStamina(amount) {
        this._currentResources.stamina = Math.min(this.maxStamina, this.stamina + amount);
        return this.stamina;
    }
    restoreMana(amount) {
        this._currentResources.mana = Math.min(this.maxMana, this.mana + amount);
        return this.mana;
    }
    restoreFocus(amount) {
        this._currentResources.focus = Math.min(this.maxFocus, this.focus + amount);
        return this.focus;
    }
    fillResource(resourceType, amount = Infinity) {
        switch (resourceType) {
            case Attributes.ResourceType.HEALTH:
                return this.restoreHealth(amount);
            case Attributes.ResourceType.STAMINA:
                return this.restoreStamina(amount);
            case Attributes.ResourceType.MANA:
                return this.restoreMana(amount);
            case Attributes.ResourceType.FOCUS:
                return this.restoreFocus(amount);
            default:
                return 0;
        }
    }
    consumeResource(resourceType, amount) {
        switch (resourceType) {
            case Attributes.ResourceType.HEALTH:
                return this.reduceHealth(amount);
            case Attributes.ResourceType.STAMINA:
                return this.reduceStamina(amount);
            case Attributes.ResourceType.MANA:
                return this.reduceMana(amount);
            case Attributes.ResourceType.FOCUS:
                return this.reduceFocus(amount);
            default:
                return 0;
        }
    }
    // --- Stat Calculations ---
    updateAllStats() {
        const eff = this.calculateEffectiveAttributes();
        this._maxResources = {
            health: Math.floor(80 + eff.vitality * 4 + eff.endurance * 1),
            stamina: Math.floor(50 + eff.endurance * 3 + eff.vitality * 0.5),
            mana: Math.floor(30 + eff.intelligence * 3 + eff.arcane * 0.5),
            focus: Math.floor(30 + eff.faith * 3 + eff.arcane * 0.5)
        };
        // Clamp current resources to new max values
        this._currentResources = {
            health: Math.min(this.health, this.maxHealth),
            stamina: Math.min(this.stamina, this.maxStamina),
            mana: Math.min(this.mana, this.maxMana),
            focus: Math.min(this.focus, this.maxFocus)
        };
        console.warn(this._maxResources);
        console.warn(JSON.stringify(this._currentResources, null, 2));
    }
    // --- Defense and Scaling ---
    getDefenseRating(damageType) {
        const eff = this.effectiveAttributes;
        switch (damageType) {
            case Attributes.DamageType.MAGIC:
                return Math.floor(eff.intelligence * 0.7 + eff.arcane * 0.3);
            case Attributes.DamageType.FIRE:
                return Math.floor(eff.intelligence * 0.5 + eff.faith * 0.5);
            case Attributes.DamageType.LIGHTNING:
                return Math.floor(eff.faith * 0.8 + eff.dexterity * 0.2);
            case Attributes.DamageType.PHYSICAL:
                return Math.floor(eff.endurance * 0.8 + eff.strength * 0.2);
            case Attributes.DamageType.SLASH:
                return Math.floor(eff.endurance * 0.6 + eff.dexterity * 0.4);
            case Attributes.DamageType.HEAVY:
                return Math.floor(eff.endurance * 0.7 + eff.strength * 0.3);
            case Attributes.DamageType.STRIKE:
                return Math.floor(eff.vitality * 0.6 + eff.endurance * 0.4);
            case Attributes.DamageType.DIVINE:
                return Math.floor(eff.faith * 0.9 + eff.arcane * 0.1);
            case Attributes.DamageType.CURSE:
                return Math.floor(eff.arcane * 0.7 + eff.faith * 0.3);
            default:
                return 10;
        }
    }
    getScalingFactor(attribute, scalingCurve = "standard") {
        const value = this.effectiveAttributes[attribute];
        const caps = Attributes.SOFT_CAPS[attribute];
        let factor = value > caps.hard ? 0.2 : value > caps.soft ? 0.5 : 1.0;
        switch (scalingCurve) {
            case "strong":
                return factor * 1.2;
            case "weak":
                return factor * 0.8;
            case "magic":
                return factor * 0.9;
            default:
                return factor;
        }
    }
    // --- Serialization ---
    serialize() {
        return {
            b: [
                this._baseAttributes.vitality,
                this._baseAttributes.endurance,
                this._baseAttributes.strength,
                this._baseAttributes.dexterity,
                this._baseAttributes.intelligence,
                this._baseAttributes.faith,
                this._baseAttributes.arcane
            ],
            v: 1
        };
    }
    loadData(data) {
        try {
            const saveData = typeof data === "string" ? JSON.parse(data) : data;
            if (!saveData.b || saveData.b.length !== 7) {
                console.error(`Invalid Attributes data for entity ${this.entity.id}`);
                return false;
            }
            [
                this._baseAttributes.vitality,
                this._baseAttributes.endurance,
                this._baseAttributes.strength,
                this._baseAttributes.dexterity,
                this._baseAttributes.intelligence,
                this._baseAttributes.faith,
                this._baseAttributes.arcane
            ] = saveData.b;
            this.updateAllStats();
            return true;
        }
        catch (e) {
            console.error(`Failed to load attributes for entity ${this.entity.id}: ${e}`);
            return false;
        }
    }
}
// Static enums with proper typing
Attributes.DamageType = {
    // Elemental
    MAGIC: Symbol("magic"),
    FIRE: Symbol("fire"),
    LIGHTNING: Symbol("lightning"),
    // Physical
    PHYSICAL: Symbol("physical"),
    SLASH: Symbol("slash"),
    HEAVY: Symbol("heavy"),
    STRIKE: Symbol("strike"),
    // Auxiliary
    DIVINE: Symbol("divine"),
    CURSE: Symbol("curse"),
    BLEED: Symbol("bleed"),
    POISON: Symbol("poison")
};
Attributes.ResourceType = {
    HEALTH: Symbol("health"),
    STAMINA: Symbol("stamina"),
    MANA: Symbol("mana"),
    FOCUS: Symbol("focus")
};
// Soft caps configuration with type safety
Attributes.SOFT_CAPS = {
    vitality: { soft: 40, hard: 60 },
    endurance: { soft: 40, hard: 60 },
    strength: { soft: 50, hard: 80 },
    dexterity: { soft: 50, hard: 80 },
    intelligence: { soft: 50, hard: 80 },
    faith: { soft: 50, hard: 80 },
    arcane: { soft: 50, hard: 80 }
};
