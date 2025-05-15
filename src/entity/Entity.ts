import * as mc from "@minecraft/server";
import { IEntity } from "./IEntity";
import { Attributes } from "./attribute/Attributes";

export class Entity implements IEntity {
	entity: mc.Entity;
	initialized: boolean = false;
	attributes: Attributes;
	shouldTick: boolean;

	constructor(entity: mc.Entity) {
		this.entity = entity;
		this.attributes = new Attributes(this);
	}

	public initEntity(data: { attributes: object }) {
		this.initialized = true;
		this.attributes.load(data);
	}

	public onTick(currentTick: number) {}

	get id(): string {
		return this.entity.id;
	}

	get location(): mc.Vector3 {
		return this.entity.location;
	}

	get dimension(): mc.Dimension {
		return this.entity.dimension;
	}
}
