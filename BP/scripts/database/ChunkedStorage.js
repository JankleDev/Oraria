import { world } from "@minecraft/server";
export class ChunkedStorage {
    constructor() {
        this.chunkSize = 30000;
        this.chunkPrefix = "db_chunk_";
    }
    set(key, data) {
        const jsonString = JSON.stringify(data);
        const chunkCount = Math.ceil(jsonString.length / this.chunkSize);
        this.clearChunks(key);
        const metadata = {
            chunkCount,
            totalSize: jsonString.length,
            timestamp: Date.now()
        };
        this.setMetadata(key, metadata);
        for (let i = 0; i < chunkCount; i++) {
            const chunk = jsonString.slice(i * this.chunkSize, (i + 1) * this.chunkSize);
            this.setDynamicProperty(this.getChunkKey(key, i), chunk);
        }
    }
    get(key) {
        const metadata = this.getMetadata(key);
        if (!metadata)
            return null;
        let combined = "";
        for (let i = 0; i < metadata.chunkCount; i++) {
            const chunk = this.getDynamicProperty(this.getChunkKey(key, i));
            if (!chunk) {
                console.warn(`Missing chunk ${i} for key: ${key}`);
                return null;
            }
            combined += chunk;
        }
        if (combined.length !== metadata.totalSize) {
            console.error(`Corrupted chunked storage for key: ${key}`);
            return null;
        }
        try {
            return JSON.parse(combined);
        }
        catch (e) {
            console.error(`Failed to parse JSON for key: ${key}`, e);
            return null;
        }
    }
    clearChunks(key) {
        const metadata = this.getMetadata(key);
        if (!metadata)
            return;
        for (let i = 0; i < metadata.chunkCount; i++) {
            this.deleteDynamicProperty(this.getChunkKey(key, i));
        }
        this.deleteDynamicProperty(this.getMetaKey(key));
    }
    getChunkKey(key, index) {
        return `${this.chunkPrefix}${key}_${index}`;
    }
    getMetaKey(key) {
        return `${this.chunkPrefix}${key}_meta`;
    }
    setMetadata(key, metadata) {
        this.setDynamicProperty(this.getMetaKey(key), JSON.stringify(metadata));
    }
    getMetadata(key) {
        const raw = this.getDynamicProperty(this.getMetaKey(key));
        try {
            return raw ? JSON.parse(raw) : null;
        }
        catch {
            return null;
        }
    }
    setDynamicProperty(key, value) {
        world.setDynamicProperty(key, value);
    }
    getDynamicProperty(key) {
        const value = world.getDynamicProperty(key);
        return typeof value === "string" ? value : null;
    }
    deleteDynamicProperty(key) {
        world.setDynamicProperty(key, undefined);
    }
}
