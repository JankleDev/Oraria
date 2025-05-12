import { world, system } from "@minecraft/server";
import { CommandConfig } from "../config/GameConstants.js";

export class CommandManager {
	constructor(server) {
		this.server = server;
		this.commands = new Map();
		this.chatCallback = null;
		this.initialize();
	}

	initialize() {
		// Register chat listener
		this.chatCallback = world.beforeEvents.chatSend.subscribe((event) => {
			this.handleCommand(event);
		});
	}

	register(command) {
		if (this.commands.has(command.name.toLowerCase())) {
			console.warn(`Command ${command.name} already registered`);
			return;
		}

		this.commands.set(command.name.toLowerCase(), command);
		console.log(`Registered command: ${command.name}`);
	}

	handleCommand(event) {
		const message = event.message.trim();
		const prefix = CommandConfig.PREFIX;

		// Check if message starts with prefix
		if (!message.startsWith(prefix)) return;

		const args = message.slice(prefix.length).split(/\s+/);
		const commandName = args.shift().toLowerCase();
		const command = this.commands.get(commandName);

		if (!command) {
			event.sender.sendMessage(`§cUnknown command. Try ${prefix}help`);
			event.cancel = true;
			return;
		}

		try {
			// Execute command and prevent default chat message
			command.execute(event.sender, args, this.server);
			event.cancel = true;
		} catch (error) {
			console.error(`Command Error [${prefix}${commandName}]:`, error);
			event.sender.sendMessage(
				"§cCommand failed. See console for details."
			);
			event.cancel = true;
		}
	}

	registerCoreCommands() {
		this.register({
			name: "help",
			description: "Show available commands",
			usage: `${CommandConfig.PREFIX}help`,
			execute: (player) => {
				const availableCommands = Array.from(
					this.commands.values()
				).filter((cmd) => this.hasPermission(player, cmd));

				player.sendMessage("§6=== Available Commands ===");
				availableCommands.forEach((cmd) => {
					player.sendMessage(`§a${cmd.usage}§f: ${cmd.description}`);
				});
			}
		});

		this.register({
			name: "tps",
			description: "Show server performance",
			permission: CommandConfig.ADMIN_PERMISSION,
			usage: `${CommandConfig.PREFIX}tps`,
			execute: (player) => {
				player.sendMessage(
					`§aServer TPS: §f${system.currentTickRate.toFixed(1)}`
				);
			}
		});
	}

	hasPermission(player, command) {
		if (!command.permission) return true;
		return player.hasTag(`perm_${command.permission}`);
	}

	shutdown() {
		if (this.chatCallback) {
			world.beforeEvents.chatSend.unsubscribe(this.chatCallback);
		}
	}
}
