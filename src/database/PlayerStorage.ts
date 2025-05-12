import { ChunkedStorage } from "./ChunkedStorage";
import { Attributes } from "../entity/attribute/Attributes";
import { RPGPlayer } from "../character/RPGPlayer";

interface PlayerAttributes {
	b: number[];
	v: number;
}

interface PlayerMeta {
	version: number;
	lastSave: number;
	dataHash: string;
}

interface PlayerBasicInfo {
	hasLoginBefore: boolean;
	firstLogin: number;
	lastLogin: number;
	playTime: number;
}

export interface PlayerData {
	basicInfo: PlayerBasicInfo;
	attributes: PlayerAttributes;
	meta: PlayerMeta;
}

export class PlayerStorage {
	private playerCache: Map<string, PlayerData> = new Map();
	private dirtyPlayers: Set<string> = new Set();
	private storage: ChunkedStorage = new ChunkedStorage();

	// Get or create player data
	public async getPlayerData(rpgPlayer: RPGPlayer, createIfMissing = true): Promise<PlayerData | null> {
		const playerId = rpgPlayer.id;

		if (this.playerCache.has(playerId)) {
			return this.playerCache.get(playerId)!;
		}

		const data = this.storage.get(`player_${playerId}`) as PlayerData | null;

		if (data || !createIfMissing) {
			if (data) this.playerCache.set(playerId, data);
			return data ?? null;
		}

		const newData = await this.createNewPlayerData(rpgPlayer);
		this.playerCache.set(playerId, newData);
		this.markDirty(playerId);
		return newData;
	}

	public async createNewPlayerData(rpgPlayer: RPGPlayer): Promise<PlayerData> {
		const now = Date.now();
		return {
			basicInfo: {
				hasLoginBefore: false,
				firstLogin: now,
				lastLogin: now,
				playTime: 0
			},
			attributes: {
				b: [10, 10, 10, 10, 10, 10, 10],
				v: 1
			},
			meta: {
				version: 1.0,
				lastSave: 0,
				dataHash: this.generateDataHash(rpgPlayer)
			}
		};
	}

	private generateDataHash(rpgPlayer: RPGPlayer): string {
		const str = "xxxxxxx1" + rpgPlayer.id + Date.now();
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash |= 0;
		}
		return hash.toString(16);
	}

	public markDirty(playerId: string): void {
		this.dirtyPlayers.add(playerId);
	}

	public saveAll(): void {
		for (const playerId of this.dirtyPlayers) {
			this.savePlayer(playerId);
		}
		this.dirtyPlayers.clear();
	}

	public savePlayer(playerId: string): void {
		const data = this.playerCache.get(playerId);
		if (!data) return;

		data.meta.lastSave = Date.now();
		data.basicInfo.lastLogin = Date.now();

		this.storage.set(`player_${playerId}`, data);
	}

	public saveAttributes(rpgPlayer: RPGPlayer): void {
		const data = this.playerCache.get(rpgPlayer.id);
		if (!data) return;

		data.attributes = rpgPlayer.attributes.serialize();
		this.markDirty(rpgPlayer.id);
	}

	public async addPlayTime(playerId: string, minutes: number): Promise<void> {
		const data = await this.getPlayerData({ id: playerId } as RPGPlayer); // shim call for ID
		if (!data) return;

		data.basicInfo.playTime += minutes;
		this.markDirty(playerId);
	}
}
