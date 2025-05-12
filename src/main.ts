import * as mc from "@minecraft/server";
import {
	Oraria
} from "./Oraria";

// Initialize Oraria when world loads
mc.world.afterEvents.worldLoad.subscribe(() => {
	const oraria = new Oraria(mc.world);
});

// Handle item use events
mc.world.afterEvents.itemUse.subscribe((ev: mc.ItemUseAfterEvent) => {
	const player = ev.source;

	// Validate player
	if (!(player instanceof mc.Player)) {
		return;
	}

	let hp: number = 0;
	let stamina: number = 0;
	let mana: number = 0;

	// Create HUD update interval
	const interval = mc.system.runInterval(() => {
		hp += 1;
		if (hp === 100) {
			hp = 0;
		}

		player.onScreenDisplay.setTitle(`updateHUD:${hp}, ${hp}, ${hp}`, {
			stayDuration: 1,
			fadeInDuration: 0,
			fadeOutDuration: 0,
			subtitle: ""
		});
	}, 5);

	// Note: Consider storing the interval if you need to clear it later
	// Example: player.hudInterval = interval;
});