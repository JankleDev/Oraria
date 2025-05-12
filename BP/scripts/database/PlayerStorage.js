import { ChunkedStorage } from "./ChunkedStorage";
export class PlayerStorage {
    constructor() {
        this.playerCache = new Map();
        this.dirtyPlayers = new Set();
        this.storage = new ChunkedStorage();
    }
    // Get or create player data
    async getPlayerData(rpgPlayer, createIfMissing = true) {
        const playerId = rpgPlayer.id;
        if (this.playerCache.has(playerId)) {
            return this.playerCache.get(playerId);
        }
        const data = this.storage.get(`player_${playerId}`);
        if (data || !createIfMissing) {
            if (data)
                this.playerCache.set(playerId, data);
            return data ?? null;
        }
        const newData = await this.createNewPlayerData(rpgPlayer);
        this.playerCache.set(playerId, newData);
        this.markDirty(playerId);
        return newData;
    }
    async createNewPlayerData(rpgPlayer) {
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
    generateDataHash(rpgPlayer) {
        const str = "xxxxxxx1" + rpgPlayer.id + Date.now();
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0;
        }
        return hash.toString(16);
    }
    markDirty(playerId) {
        this.dirtyPlayers.add(playerId);
    }
    saveAll() {
        for (const playerId of this.dirtyPlayers) {
            this.savePlayer(playerId);
        }
        this.dirtyPlayers.clear();
    }
    savePlayer(playerId) {
        const data = this.playerCache.get(playerId);
        if (!data)
            return;
        data.meta.lastSave = Date.now();
        data.basicInfo.lastLogin = Date.now();
        this.storage.set(`player_${playerId}`, data);
    }
    saveAttributes(rpgPlayer) {
        const data = this.playerCache.get(rpgPlayer.id);
        if (!data)
            return;
        data.attributes = rpgPlayer.attributes.serialize();
        this.markDirty(rpgPlayer.id);
    }
    async addPlayTime(playerId, minutes) {
        const data = await this.getPlayerData({ id: playerId }); // shim call for ID
        if (!data)
            return;
        data.basicInfo.playTime += minutes;
        this.markDirty(playerId);
    }
}
