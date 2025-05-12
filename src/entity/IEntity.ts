export interface IEntity {
	id: string;
	initEntity(data: { attributes: object }): void;
	onTick(tick: number): void;
}
