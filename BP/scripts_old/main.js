// 📄 main.js
import { world, system } from "@minecraft/server";
import { WorldConfig, ServerConfig } from "./config/GameConstants.js";
import { CommandManager } from "./systems/CommandManager.js";
import { PlayerManager } from "./systems/PlayerManager.js";
import { MountSystem } from "./systems/MountSystem.js";

class OrariaServer {
	constructor() {
		// Test mode detection
		this.isTestMode = ServerConfig.FORCE_TEST_MODE;

		// Initialize core systems
		this.commands = new CommandManager(this);
		this.players = new PlayerManager(this);
		this.mounts = new MountSystem(this);

		// Register commands
		this.registerCommands();

		// Set up world
		this.initializeWorld();

		// Run tests if in test mode
		if (this.isTestMode) {
			this.runTests();
		}

		console.log("§aOraria RPG Server initialized");
	}

	initializeWorld() {
		world.setDefaultSpawnLocation(WorldConfig.SPAWN_LOCATION);
		world.sendMessage(`§6Oraria RPG v${ServerConfig.VERSION} loaded!`);

		// Set up cleanup on world unload
		world.afterEvents.worldUnload.subscribe(() => {
			this.shutdown();
		});
	}

	registerCommands() {
		// Core commands
		this.commands.registerCoreCommands();

		// Feature commands
		if (this.isTestMode) {
			this.commands.register({
				name: "test",
				description: "Run server tests",
				permission: "admin",
				execute: (player) => {
					player.sendMessage("§aRunning tests...");
					this.runTests();
					player.sendMessage("§aTests completed! Check console.");
				}
			});
		}
	}

	runTests() {
		console.log("=== RUNNING SERVER TESTS ===");

		// Player system tests
		this.testPlayerSystem();

		// Command system tests
		this.testCommandSystem();

		console.log("=== TESTING COMPLETE ===");
	}

	testPlayerSystem() {
		console.log("[TEST] Player System:");

		// Simulate player join
		const testPlayer = this.createTestPlayer();
		this.players.handleJoin(testPlayer);

		// Verify data loaded
		const rpgClass = testPlayer.getDynamicProperty("rpgClass");
		console.assert(rpgClass, "Player data should be loaded");
		console.log("- Join test passed");

		// Simulate level up
		rpgClass.addExperience(1000);
		console.assert(rpgClass.level === 2, "Level up should work");
		console.log("- Level up test passed");

		// Simulate player leave
		this.players.handleLeave(testPlayer.id);
		console.log("- Leave test passed");
	}

	testCommandSystem() {
		console.log("[TEST] Command System:");

		const testPlayer = this.createTestPlayer();

		// Test valid command
		this.commands.handleCommand({
			sender: testPlayer,
			message: "!help"
		});
		console.log("- Valid command test passed");

		// Test invalid command
		this.commands.handleCommand({
			sender: testPlayer,
			message: "!notacommand"
		});
		console.log("- Invalid command test passed");
	}

	createTestPlayer() {
		return {
			id: "test_player_" + Math.random().toString(36).substring(7),
			name: "TestPlayer",
			sendMessage: (msg) => console.log(`[PLAYER] ${msg}`),
			getDynamicProperty: (key) => null,
			setDynamicProperty: (key, value) => {},
			hasTag: (tag) => true,
			getComponent: (comp) => ({
				container: {
					addItem: () => true,
					setItem: () => {}
				}
			})
		};
	}

	shutdown() {
		console.log("§6Server shutting down...");
		this.players.shutdown();
		this.commands.shutdown();
		this.mounts.shutdown();
	}
}

// Initialize server
const server = new OrariaServer();
