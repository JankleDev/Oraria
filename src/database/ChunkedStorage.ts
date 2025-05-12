import { world } from "@minecraft/server";

interface ChunkMetadata {
	chunkCount: number;
	totalSize: number;
	timestamp: number;
}

export class ChunkedStorage {
	private readonly chunkSize: number = 30000;
	private readonly chunkPrefix: string = "db_chunk_";

	set<T = any>(key: string, data: T): void {
		const jsonString = JSON.stringify(data);
		const chunkCount = Math.ceil(jsonString.length / this.chunkSize);

		this.clearChunks(key);

		const metadata: ChunkMetadata = {
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

	get<T = any>(key: string): T | null {
		const metadata = this.getMetadata(key);
		if (!metadata) return null;

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
		} catch (e) {
			console.error(`Failed to parse JSON for key: ${key}`, e);
			return null;
		}
	}

	clearChunks(key: string): void {
		const metadata = this.getMetadata(key);
		if (!metadata) return;

		for (let i = 0; i < metadata.chunkCount; i++) {
			this.deleteDynamicProperty(this.getChunkKey(key, i));
		}
		this.deleteDynamicProperty(this.getMetaKey(key));
	}

	private getChunkKey(key: string, index: number): string {
		return `${this.chunkPrefix}${key}_${index}`;
	}

	private getMetaKey(key: string): string {
		return `${this.chunkPrefix}${key}_meta`;
	}

	private setMetadata(key: string, metadata: ChunkMetadata): void {
		this.setDynamicProperty(this.getMetaKey(key), JSON.stringify(metadata));
	}

	private getMetadata(key: string): ChunkMetadata | null {
		const raw = this.getDynamicProperty(this.getMetaKey(key));
		try {
			return raw ? JSON.parse(raw) : null;
		} catch {
			return null;
		}
	}

	private setDynamicProperty(key: string, value: string): void {
		world.setDynamicProperty(key, value);
	}

	private getDynamicProperty(key: string): string | null {
		const value = world.getDynamicProperty(key);
		return typeof value === "string" ? value : null;
	}

	private deleteDynamicProperty(key: string): void {
		world.setDynamicProperty(key, undefined);
	}
}
