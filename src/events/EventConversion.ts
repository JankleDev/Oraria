import * as mc from "@minecraft/server";
import { PlayerInteractEvent } from "./PlayerInteractEvent";
import { HitboxSystem } from "../core/HitboxSystem";

function convert() {
	mc.world.afterEvents.entityHitEntity.subscribe((event) => {
		const { damagingEntity, hitEntity } = event;
		if (
			hitEntity.typeId === HitboxSystem.HITBOX_TYPE_ID ||
			hitEntity.typeId === HitboxSystem.HITBOX_CONNECTOR_TYPE_ID
		) {
			if (damagingEntity instanceof mc.Player) {
				let viewDir = damagingEntity.getViewDirection();
				let ev = new PlayerInteractEvent(damagingEntity, viewDir, PlayerInteractEvent.LEFT_CLICK);
				ev.call();
			}
		}
	});
	mc.world.beforeEvents.playerInteractWithEntity.subscribe((event) => {
		const { player, target } = event;
		if (target.typeId === HitboxSystem.HITBOX_TYPE_ID || target.typeId === HitboxSystem.HITBOX_CONNECTOR_TYPE_ID) {
			let viewDir = player.getViewDirection();
			let ev = new PlayerInteractEvent(player, viewDir, PlayerInteractEvent.RIGHT_CLICK);
			ev.call();
		}
	});
}

convert();
