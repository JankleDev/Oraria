import { world } from "@minecraft/server";

export class ChunkedStorage {
	constructor() {
		this.chunkSize = 30000;
		this.chunkPrefix = "db_chunk_";
	}

	set(key, data) {
		// Convert to JSON string
		const jsonString = JSON.stringify(data);

		// Calculate number of chunks needed
		const chunkCount = Math.ceil(jsonString.length / this.chunkSize);

		// Clear existing chunks
		this.clearChunks(key);

		// Store chunk metadata
		const metadata = {
			chunkCount,
			totalSize: jsonString.length,
			timestamp: Date.now()
		};
		this.setMetadata(key, metadata);

		// Store actual data in chunks
		for (let i = 0; i < chunkCount; i++) {
			const chunk = jsonString.substr(i * this.chunkSize, this.chunkSize);
			const chunkKey = `${this.chunkPrefix}${key}_${i}`;
			this.setDynamicProperty(chunkKey, chunk);
		}
	}

	get(key) {
		const metadata = this.getMetadata(key);
		if (!metadata) return null;

		// Read all chunks
		let combined = "";
		for (let i = 0; i < metadata.chunkCount; i++) {
			const chunkKey = `${this.chunkPrefix}${key}_${i}`;
			const chunk = this.getDynamicProperty(chunkKey);
			if (chunk) combined += chunk;
		}

		// Verify we got all data
		if (combined.length !== metadata.totalSize) {
			console.error(`Chunked storage corrupted for key: ${key}`);
			return null;
		}

		return JSON.parse(combined);
	}

	clearChunks(key) {
		const metadata = this.getMetadata(key);
		if (metadata) {
			for (let i = 0; i < metadata.chunkCount; i++) {
				const chunkKey = `${this.chunkPrefix}${key}_${i}`;
				this.deleteDynamicProperty(chunkKey);
			}
		}
		this.deleteDynamicProperty(`${this.chunkPrefix}${key}_meta`);
	}

	// TODO: change this with more optimized option.
	setDynamicProperty(key, value) {
		world.setDynamicProperty(key, value);
	}

	getDynamicProperty(key) {
		return world.getDynamicProperty(key);
	}

	deleteDynamicProperty(key) {
		world.setDynamicProperty(key, undefined);
	}

	setMetadata(key, metadata) {
		this.setDynamicProperty(`${this.chunkPrefix}${key}_meta`, JSON.stringify(metadata));
	}

	getMetadata(key) {
		const meta = this.getDynamicProperty(`${this.chunkPrefix}${key}_meta`);
		return meta ? JSON.parse(meta) : null;
	}
}
