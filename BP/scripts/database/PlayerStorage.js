import { ChunkedStorage } from "./ChunkedStorage.js";
import { Attributes } from "../entity/attribute/Attributes.js"

export class PlayerStorage {
	playerCache;
	storage;
	dirtyPlayers;

	constructor() {
		// In-memory cache of player data
		this.playerCache = new Map();

		// Storage system for player data
		this.storage = new ChunkedStorage();

		// Track which players have unsaved changes
		this.dirtyPlayers = new Set();
	}

	// Get or create player data
	async getPlayerData(rpgPlayer, createIfMissing = true) {
		const playerId = rpgPlayer.id;
		// Check cache first
		if (this.playerCache.has(playerId)) {
			return this.playerCache.get(playerId);
		}

		// Load from storage
		const data = this.storage.get(`player_${playerId}`);
		if (data || !createIfMissing) {
			this.playerCache.set(playerId, data);
			return data;
		}

		// Create new player data
		const newPlayerData = await this.createNewPlayerData(rpgPlayer);
		this.playerCache.set(playerId, newPlayerData);
		this.markDirty(playerId);
		return newPlayerData;
	}

	async createNewPlayerData(rpgPlayer) {
		return {
			// Core player info
			basicInfo: {
				hasLoginBefore: false,
				firstLogin: Date.now(),
				lastLogin: Date.now(),
				playTime: 0
			},

			attributes: {
				b: [10, 10, 10, 10, 10, 10, 10],
				v: 1
			},

			// Economy
			economy: {
				currency: 10,
				bankBalance: 0,
				transactions: []
			},

			// System info
			meta: {
				version: 1.0,
				lastSave: 0,
				dataHash: this.generateDataHash(rpgPlayer)
			}
		};
	}

	generateDataHash(rpgPlayer) {
		// Create a simple hash for data validation
		const str = "xxxxxxx1" + rpgPlayer.id + Date.now();
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash |= 0; // Convert to 32bit integer
		}
		return hash.toString(16);
	}

	// Mark player data as changed
	markDirty(playerId) {
		this.dirtyPlayers.add(playerId);
	}

	// Save all dirty player data
	saveAll() {
		for (const playerId of this.dirtyPlayers) {
			this.savePlayer(playerId);
		}
		this.dirtyPlayers.clear();
	}

	// Save specific player
	savePlayer(playerId) {
		const data = this.playerCache.get(playerId);
		if (!data) return;

		// Update data
		data.meta.lastSave = Date.now();
		data.basicInfo.lastLogin = Date.now();

		// Save to storage
		this.storage.set(`player_${playerId}`, data);
	}

	saveAttributes(rpgPlayer) {
		const data = this.playerCache.get(rpgPlayer.id);
		if (!data) return;

		const attributes = rpgPlayer.attributes.serialize();
		data.attributes = attributes;

		this.markDirty(rpgPlayer.id);
	}

	// //  Update player's last known location
	//	updatePlayerLocation(playerId, dimension, x, y, z) {
	//		const data = this.getPlayerData(playerId);
	//		data.basicInfo.lastLocation = { dimension, x, y, z };
	//		this.markDirty(playerId);
	//	}
	//
	// Add play time (in minutes)
	addPlayTime(playerId, minutes) {
		const data = this.getPlayerData(playerId);
		data.basicInfo.playTime += minutes;
		this.markDirty(playerId);
	}
}
