import {
	World,
	system,
	Player,
	Entity,
	ItemStack,
	ItemLockMode
} from "../../config/Imports.js";
import { PlayerConfig } from "../config/GameConstants.js";
import { BaseStats } from "../Attributes/BaseStats.js";
import { PlayerMount } from "../Mount/PlayerMount.js";

export class RPGClass extends BaseStats {
	constructor(player) {
		super(player);
		this.player = player;
		this.level = 1;
		this.experience = 0;
		this.availablePoints = 0;
		this.maxLevel = 50;

		this.mountSystem = new PlayerMount(player);
		this.equipment = this.initEquipment();
		this.consumables = [];

		// Load saved data if exists
		this.loadData();
	}

	// Modified BaseStats calculation to include weight
	calculateDerivedStats() {
		const baseStats = super.calculateDerivedStats();

		// Weight impact (0.8-1.2 speed multiplier based on load)
		const weightRatio = this.equipLoad / baseStats.equipLoadThreshold;
		baseStats.speedMultiplier = 1.2 - weightRatio * 0.4;

		// Apply mount bonuses if mounted
		if (this.mountSystem.isMounted()) {
			baseStats.equipLoadThreshold *= 3; // 3x carry capacity when mounted
			baseStats.speedMultiplier *= 1.3; // 30% speed boost from mount
		}

		return baseStats;
	}

	// Level progression system
	addExperience(amount) {
		if (this.level >= this.maxLevel) return;

		this.experience += amount;
		const needed = this.getExpForNextLevel();

		if (this.experience >= needed) {
			this.levelUp();
		}
	}

	getExpForNextLevel() {
		// Exponential curve that slows after level 30
		const base = 1000;
		const growth = this.level < 30 ? 1.15 : 1.08;
		return Math.floor(base * Math.pow(growth, this.level - 1));
	}

	levelUp() {
		this.level++;
		this.availablePoints += 2; // 2 points per level
		this.experience = 0;

		// Update stats
		this.derivedStats = this.calculateDerivedStats();
		this.currentValues.health = this.derivedStats.maxHealth;
		this.currentValues.mana = this.derivedStats.maxMana;

		this.player.sendMessage(`§6§lLEVEL UP! §r§f(Level ${this.level})`);
		this.player.sendMessage(
			`§aYou have ${this.availablePoints} stat points available!`
		);

		// Check for milestone unlocks
		this.checkStatMilestones();
	}

	allocateStatPoint(stat) {
		if (this.availablePoints <= 0) return false;
		if (!this.attributes.hasOwnProperty(stat)) return false;

		this.attributes[stat]++;
		this.availablePoints--;
		this.derivedStats = this.calculateDerivedStats();

		this.player.sendMessage(
			`§a${stat.toUpperCase()} increased to ${this.attributes[stat]}`
		);
		return true;
	}

	// Mount system integration
	initMountSystem() {
		// Create whistle item in inventory
		const whistle = new ItemStack("orcaria:summon_whistle");
		whistle.nameTag = "§bMount Whistle";
		whistle.setLore(["§7Right-click to summon/dismiss mount"]);
		whistle.lockMode = ItemLockMode.slot;

		// Give if player doesn't have one
		if (!this.player.hasItem(whistle)) {
			this.player.getComponent("inventory").container.addItem(whistle);
		}

		// Register item use handler
		this.player.onItemUse((event) => {
			if (event.item.typeId === "orcaria:summon_whistle") {
				this.toggleMount();
				event.cancel = true;
			}
		});
	}

	toggleMount() {
		if (this.mountSystem.isMounted()) {
			this.mountSystem.dismissMount();
			this.player.sendMessage("§aMount dismissed");
		} else {
			// Check if in allowed area
			if (!this.canSummonMountHere()) {
				this.player.sendMessage("§cYou can't summon mounts here");
				return;
			}

			this.mountSystem.summonMount(this.getPreferredMount());
			this.player.sendMessage("§aMount summoned!");

			// Update stats immediately
			this.derivedStats = this.calculateDerivedStats();
		}
	}

	// Equipment and item handling
	initEquipment() {
		return {
			head: null,
			chest: null,
			legs: null,
			feet: null,
			mainHand: null,
			offHand: null,
			accessories: [null, null]
		};
	}

	equipItem(item) {
		// Check requirements
		if (item.requiredLevel > this.level) {
			this.player.sendMessage(`§cRequires level ${item.requiredLevel}`);
			return false;
		}

		// Find appropriate slot
		const slot = this.getEquipmentSlot(item);
		if (!slot) return false;

		// Unequip current item first
		if (this.equipment[slot]) this.unequipItem(slot);

		// Equip new item
		this.equipment[slot] = item;
		this.applyItemStats(item);

		// Update weight
		this.equipLoad += item.weight;
		this.derivedStats = this.calculateDerivedStats();

		this.player.sendMessage(`§aEquipped ${item.name}`);
		return true;
	}

	applyItemStats(item) {
		// Apply flat stat bonuses
		Object.entries(item.statBonuses || {}).forEach(([stat, value]) => {
			this.attributes[stat] += value;
		});

		// Apply temporary consumable effects
		if (item.temporaryEffects) {
			item.temporaryEffects.forEach((effect) => {
				this.addStatusEffect(effect);
			});
		}
	}

	// Optimized mount cleanup
	onChunkUnload() {
		if (this.mountSystem.isMounted()) {
			this.mountSystem.dismissMount();
		}
	}

	// Serialization
	serialize() {
		return {
			...super.serialize(),
			level: this.level,
			experience: this.experience,
			availablePoints: this.availablePoints,
			mountData: this.mountSystem.serialize(),
			equipment: this.serializeEquipment()
		};
	}

	deserialize(data) {
		super.deserialize(data);
		this.level = data.level || 1;
		this.experience = data.experience || 0;
		this.availablePoints = data.availablePoints || 0;
		this.mountSystem.deserialize(data.mountData || {});
		this.deserializeEquipment(data.equipment || {});
	}
}
