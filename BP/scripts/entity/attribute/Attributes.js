export class Attributes {
	// Static enums
	static DamageType = {
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

	static ResourceType = {
		HEALTH: Symbol("health"),
		STAMINA: Symbol("stamina"),
		MANA: Symbol("mana"),
		FOCUS: Symbol("focus")
	};

	// Soft caps configuration
	static SOFT_CAPS = {
		vitality: { soft: 40, hard: 60 },
		endurance: { soft: 40, hard: 60 },
		strength: { soft: 50, hard: 80 },
		dexterity: { soft: 50, hard: 80 },
		intelligence: { soft: 50, hard: 80 },
		faith: { soft: 50, hard: 80 },
		arcane: { soft: 50, hard: 80 }
	};

	_baseAttributes;
	_currentResources;
	_maxResources;

	constructor(entity) {
		this.entity = entity;

		// Current resources
		this._currentResources = {
			health: 0,
			stamina: 0,
			mana: 0,
			focus: 0
		};

		// Max resources
		this._maxResources = {
			health: 0,
			stamina: 0,
			mana: 0,
			focus: 0
		};
	}

	// --- Attributes Management ---
	get baseAttributes() {
		return { ...this._baseAttributes };
	}

	get effectiveAttributes() {
		return this.calculateEffectiveAttributes();
	}

	increaseAttribute(attribute, amount = 1) {
		if (this._baseAttributes.hasOwnProperty(attribute)) {
			this._baseAttributes[attribute] += amount;
			this.updateAllStats();
			return true;
		}
		return false;
	}

	calculateEffectiveAttributes() {
		const effective = {};
		for (const [attr, value] of Object.entries(this._baseAttributes)) {
			const caps = Attributes.SOFT_CAPS[attr];
			if (value > caps.hard) {
				effective[attr] = caps.hard + (value - caps.hard) * 0.2;
			} else if (value > caps.soft) {
				effective[attr] = caps.soft + (value - caps.soft) * 0.5;
			} else {
				effective[attr] = value;
			}
		}
		return effective;
	}

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

		// Health scales with vitality
		this._maxResources.health = Math.floor(80 + eff.vitality * 4 + eff.endurance * 1);

		// Stamina scales with endurance
		this._maxResources.stamina = Math.floor(50 + eff.endurance * 3 + eff.vitality * 0.5);

		// Mana scales with intelligence
		this._maxResources.mana = Math.floor(30 + eff.intelligence * 3 + eff.arcane * 0.5);

		// Focus scales with faith
		this._maxResources.focus = Math.floor(30 + eff.faith * 3 + eff.arcane * 0.5);

		// Ensure current doesn't exceed max
		this._currentResources.health = Math.min(this.health, this.maxHealth);
		this._currentResources.stamina = Math.min(this.stamina, this.maxStamina);
		this._currentResources.mana = Math.min(this.mana, this.maxMana);
		this._currentResources.focus = Math.min(this.focus, this.maxFocus);
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

		if (!caps) return 0;

		let factor;
		if (value > caps.hard) {
			factor = 0.2;
		} else if (value > caps.soft) {
			factor = 0.5;
		} else {
			factor = 1.0;
		}

		// Adjust based on scaling curve
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

	serialize() {
		return {
			// Base Attributes only - no derived stats
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
			const saveData = JSON.parse(data);

			// Validate structure
			if (!saveData.b || saveData.b.length !== 7) {
				console.error(`Invalid Attributes data for player ${this.entity.id}`);
				return false;
			}

			// Restore base attributes from compact array
			this._baseAttributes.vitality = saveData.b[0];
			this._baseAttributes.endurance = saveData.b[1];
			this._baseAttributes.strength = saveData.b[2];
			this._baseAttributes.dexterity = saveData.b[3];
			this._baseAttributes.intelligence = saveData.b[4];
			this._baseAttributes.faith = saveData.b[5];
			this._baseAttributes.arcane = saveData.b[6];

			// Restore level and experience if available
			/*if (saveData.l !== undefined) {
				this.level = saveData.l;
				this.experience = saveData.x || 0;
			}*/

			// Recalculate all derived stats
			this.updateAllStats();

			return true;
		} catch (e) {
			console.error(`Failed to load attributes for player ${this.entity.id}: ${e}`);
			return false;
		}
	}
}
