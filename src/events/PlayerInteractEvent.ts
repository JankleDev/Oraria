import { Player, Entity, Vector3, ItemStack } from "@minecraft/server";
import { Event } from "../core/EventSystem";

export class PlayerInteractEvent extends Event {
	static readonly NAME = "PlayerInteractEvent";
	static readonly LEFT_CLICK = 0;
	static readonly RIGHT_CLICK = 1;
	public player: Player;
	public action: number;
	public viewDir: Vector3;

	constructor(player: Player, viewDir: Vector3, action: number = PlayerInteractEvent.RIGHT_CLICK) {
		super(PlayerInteractEvent.NAME);
		this.player = player;
		this.action = action;
		this.viewDir = viewDir;
	}

	getAction(): number {
		return this.action;
	}

	getViewDir(): Vector3 {
		return this.viewDir;
	}
}
