import { Attributes } from "./attribute/Attributes";
export class Entity {
    constructor(entity) {
        this.initialized = false;
        this.entity = entity;
        this.attributes = new Attributes(this);
    }
    initEntity(data) {
        this.initialized = true;
        this.attributes.load(data);
    }
    onTick(currentTick) { }
    get id() {
        return this.entity.id;
    }
    get location() {
        return this.entity.location;
    }
    get dimension() {
        return this.entity.dimension;
    }
}
