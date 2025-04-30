// 📄 entities/Mob.js
import { MobDamageEvent, MobDeathEvent } from "./MobEvents.js";

export class Mob {
	health = 100;
	name = "Generic Mob";

	attack(damager, damage = 0) {
		// Create and call damage event
		const damageEvent = new MobDamageEvent(this, damager, damage);
		damageEvent.call();
		console.log('damageEvent called');

		// Only process if not cancelled
		if (!damageEvent.cancelled && damage > 0) {
			this.health -= damage;

			// Check for death
			if (this.health <= 0) {
				const deathEvent = new MobDeathEvent(this, damager);
				deathEvent.call();
			}
		}
	}
}
