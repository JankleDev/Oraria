// 📁 systems/PlayerManager.js
import { world, system } from "@minecraft/server";
import { PlayerConfig } from "../config/GameConstants.js";
import { RPGClass } from "../character/RPGClass.js";

export class PlayerManager {
	constructor(server) {
		this.server = server;
		this.players = new Map();
		this.saveInterval = null;
		this.initialize();
	}

	initialize() {
		// Load existing players
		world.getAllPlayers().forEach((player) => {
			this.handleJoin(player);
		});

		// Set up event handlers
		world.afterEvents.playerSpawn.subscribe(({ player }) => {
			this.handleJoin(player);
		});

		world.beforeEvents.playerLeave.subscribe(({ playerId }) => {
			this.handleLeave(playerId);
		});

		// Auto-save every 5 minutes (300 seconds)
		this.saveInterval = system.runInterval(() => {
			this.saveAllPlayers();
		}, 300 * 20); // Convert seconds to ticks
	}

	handleJoin(player) {
		try {
			// Load or create player data
			const data = this.loadPlayerData(player);
			const rpgClass = new RPGClass(player, data);

			player.setDynamicProperty("rpgClass", rpgClass);
			this.players.set(player.id, { player, rpgClass });

			player.sendMessage(`§aWelcome back to Oraria!`);

			if (system.isDebugMode) {
				console.log(`Player joined: ${player.name} (${player.id})`);
			}
		} catch (error) {
			console.error(`Error loading player ${player.name}:`, error);
			player.sendMessage("§cError loading your data. Contact admin.");
		}
	}

	handleLeave(playerId) {
		const playerData = this.players.get(playerId);
		if (playerData) {
			try {
				playerData.rpgClass.save();
				this.players.delete(playerId);

				if (system.isDebugMode) {
					console.log(`Player left: ${playerData.player.name}`);
				}
			} catch (error) {
				console.error(`Error saving player ${playerId}:`, error);
			}
		}
	}

	loadPlayerData(player) {
		// Try to load existing data
		const savedData = player.getDynamicProperty("rpgData");

		if (savedData) {
			return JSON.parse(savedData);
		}

		// Create new player data
		return {
			level: PlayerConfig.STARTING_LEVEL,
			experience: 0,
			Attributess: {
				vigor: 10,
				mind: 10,
				endurance: 10,
				strength: 10,
				dexterity: 10,
				intelligence: 10,
				faith: 10,
				arcane: 10
			},
			inventory: [],
			lastLogin: Date.now()
		};
	}

	saveAllPlayers() {
		let savedCount = 0;
		this.players.forEach(({ rpgClass }) => {
			try {
				rpgClass.save();
				savedCount++;
			} catch (error) {
				console.error("Error saving player:", error);
			}
		});

		console.log(`Auto-saved ${savedCount} players`);
	}

	shutdown() {
		// Save all players before shutdown
		this.saveAllPlayers();

		// Clear interval
		if (this.saveInterval) {
			system.clearRun(this.saveInterval);
		}
	}
}
