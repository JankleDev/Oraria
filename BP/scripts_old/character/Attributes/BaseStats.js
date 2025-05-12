export class BaseStats {
	constructor(entity) {
		this.entity = entity;
		this.attributes = {
			vigor: 10, // Health
			mind: 10, // Mana
			endurance: 10, // Stamina/Defense
			strength: 10, // Physical Power
			dexterity: 10, // Speed/Crit
			intelligence: 10, // Magic Power
			faith: 10 // Holy/Divine
		};

		this.derivedStats = this.calculateDerivedStats();
		this.currentValues = {
			health: this.derivedStats.maxHealth,
			mana: this.derivedStats.maxMana,
			stamina: this.derivedStats.maxStamina
		};

		this.statGrowthRates = this.getGrowthRates();
		this.equipLoad = 0;
	}

	calculateDerivedStats() {
		return {
			// Health scales strongly until 40 vigor, then diminishes
			maxHealth: this.softCapScale(
				this.attributes.vigor,
				100,
				30,
				40,
				0.5
			),

			// Mana has two soft caps at 25 and 50 mind
			maxMana: this.softCapScale(this.attributes.mind, 100, 25, 50, 0.3),

			// Stamina scales linearly with endurance
			maxStamina: 100 + this.attributes.endurance * 2,

			// Physical defense has class-specific scaling
			physicalDefense:
				15 +
				Math.floor(
					this.attributes.endurance * this.getDefenseMultiplier()
				),

			// Magic defense combines mind and intelligence
			magicDefense:
				10 +
				Math.floor(
					this.attributes.mind * 0.7 +
						this.attributes.intelligence * 0.3
				),

			// Critical chance based on dexterity
			criticalChance: Math.min(
				0.05 + this.attributes.dexterity * 0.005,
				0.3
			),

			// Critical damage multiplier
			criticalMultiplier: 1.5 + this.attributes.dexterity * 0.01,

			// Stamina regeneration
			staminaRegen: 10 + this.attributes.endurance * 0.2,

			// Mana regeneration
			manaRegen: 5 + this.attributes.mind * 0.5,

			// Equipment load system
			equipLoadThreshold: 50 + this.attributes.endurance * 2,
			rollType: this.calculateRollType()
		};
	}

	softCapScale(stat, base, firstCap, secondCap, postCapMultiplier) {
		let value = base;

		// Pre-first cap scaling
		value += Math.min(stat, firstCap) * 3;

		// Between first and second cap
		if (stat > firstCap) {
			value += (Math.min(stat, secondCap) - firstCap) * 2;
		}

		// Post-second cap scaling
		if (stat > secondCap) {
			value += (stat - secondCap) * postCapMultiplier;
		}

		return Math.floor(value);
	}

	getDefenseMultiplier() {
		// Base multiplier, overridden by classes
		return 1.0;
	}

	getGrowthRates() {
		// Base growth rates, overridden by classes
		return {
			vigor: 1.0,
			mind: 1.0,
			endurance: 1.0,
			strength: 1.0,
			dexterity: 1.0,
			intelligence: 1.0,
			faith: 1.0,
			arcane: 1.0
		};
	}

	calculateRollType() {
		const loadRatio = this.equipLoad / this.derivedStats.equipLoadThreshold;

		if (loadRatio < 0.3) return "light"; // Fast roll
		if (loadRatio < 0.7) return "medium"; // Normal roll
		return "heavy"; // Slow roll
	}

	regenerateResources() {
		// Mana regeneration
		if (this.currentValues.mana < this.derivedStats.maxMana) {
			this.currentValues.mana = Math.min(
				this.currentValues.mana + this.derivedStats.manaRegen,
				this.derivedStats.maxMana
			);
		}

		// Stamina regeneration
		if (this.currentValues.stamina < this.derivedStats.maxStamina) {
			this.currentValues.stamina = Math.min(
				this.currentValues.stamina + this.derivedStats.staminaRegen,
				this.derivedStats.maxStamina
			);
		}
	}

	takeDamage(amount, damageType = "physical") {
		const defense =
			damageType === "magic"
				? this.derivedStats.magicDefense
				: this.derivedStats.physicalDefense;

		const mitigatedDamage = Math.max(1, amount - defense * 0.5);
		this.currentValues.health -= mitigatedDamage;

		return mitigatedDamage;
	}

	restoreHealth(amount) {
		this.currentValues.health = Math.min(
			this.currentValues.health + amount,
			this.derivedStats.maxHealth
		);
	}

	consumeMana(amount) {
		if (this.currentValues.mana >= amount) {
			this.currentValues.mana -= amount;
			return true;
		}
		return false;
	}

	consumeStamina(amount) {
		if (this.currentValues.stamina >= amount) {
			this.currentValues.stamina -= amount;
			return true;
		}
		return false;
	}

	checkStatMilestones() {
		// Called on level up to check for new unlocks
		Object.entries(this.attributes).forEach(([stat, value]) => {
			if (value % 5 === 0) {
				this.onStatMilestone(stat, value);
			}
		});
	}

	onStatMilestone(stat, value) {
		// Override in child classes for specific unlocks
		this.entity.sendMessage(`§eYour ${stat} reached ${value}!`);
	}

	serialize() {
		return {
			attributes: this.attributes,
			currentValues: this.currentValues,
			equipLoad: this.equipLoad
		};
	}

	deserialize(data) {
		this.attributes = data.attributes || this.attributes;
		this.currentValues = data.currentValues || {
			health: this.derivedStats.maxHealth,
			mana: this.derivedStats.maxMana,
			stamina: this.derivedStats.maxStamina
		};
		this.equipLoad = data.equipLoad || 0;
		this.derivedStats = this.calculateDerivedStats();
	}
}
