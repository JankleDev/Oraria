import * as mc from "@minecraft/server";
import {
	Oraria
} from "./Oraria.js";

mc.world.afterEvents.worldLoad.subscribe(() => {
	const oraria = new Oraria(mc.world);
});
mc.world.afterEvents.itemUse.subscribe((ev) => {
	const player = ev.source;
	let hp = 0;
	let stamina = 0;
	let mana = 0;

	mc.system.runInterval(() => {
		hp += 1;
		if (hp === 100) hp = 0;

		player.onScreenDisplay.setTitle(`updateHUD:${hp}, ${hp}, ${hp}`, {
			stayDuration: 1,
			fadeInDuration: 0,
			fadeOutDuration: 0,
			subtitle: `updateHUD:${hp}, ${hp}, ${hp}`,
		});
	}, 5);
	/*
	    mc.system.runInterval(() => {
			stamina =+ 1;
			if (stamina = 100) stamina = 0;
	       player.onScreenDisplay.setTitle(`stamina1:${stamina}`, {
	    stayDuration: 1,
	    fadeInDuration: 1,
	    fadeOutDuration: 1,
	    subtitle: ``,
	  });
	       player.onScreenDisplay.setTitle(`stamina2:${stamina}`, {
	    stayDuration: 1,
	    fadeInDuration: 1,
	    fadeOutDuration: 1,
	    subtitle: ``,
	  });
	    }, 5);
	    mc.system.runInterval(() => {
			mana =+ 1;
			if (mana = 100) mana = 0;
	       player.onScreenDisplay.setTitle(`mana1:${mana}`, {
	    stayDuration: 1,
	    fadeInDuration: 1,
	    fadeOutDuration: 1,
	    subtitle: ``,
	  });
	       player.onScreenDisplay.setTitle(`mana2:${mana}`, {
	    stayDuration: 1,
	    fadeInDuration: 1,
	    fadeOutDuration: 1,
	    subtitle: ``,
	  });
	    }, 7);*/
});