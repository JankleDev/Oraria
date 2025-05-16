import { system } from "@minecraft/server";
import { Ability, AbilityRegistry, ComboAbilityManager } from "./AbilitySystem";
class FlameBurst extends Ability {
    constructor() {
        super("flame_burst", 40); // cooldown in ticks
    }
    activate(ctx) {
        const { player } = ctx;
        const dir = player.getViewDirection();
        const loc = player.getHeadLocation();
        for (let i = 1; i <= 5; i++) {
            const spawnLoc = {
                x: loc.x + dir.x * i,
                y: loc.y + dir.y * i,
                z: loc.z + dir.z * i
            };
            player.dimension.spawnParticle("minecraft:flame_particle", spawnLoc);
        }
        player.runCommand(`playsound random.explode @s`);
    }
}
class WindSlash extends Ability {
    constructor() {
        super("wind_slash", 30);
    }
    activate(ctx) {
        system.run(() => {
            const { player } = ctx;
            const entities = player.dimension.getEntities({ maxDistance: 6, location: player.location });
            for (const entity of entities) {
                if (entity.id === player.id)
                    continue;
                const eLoc = entity.location;
                const dir = {
                    x: eLoc.x - player.location.x,
                    y: eLoc.y - player.location.y,
                    z: eLoc.z - player.location.z
                };
                const len = Math.sqrt(dir.x ** 2 + dir.y ** 2 + dir.z ** 2);
                entity.applyKnockback({ x: dir.x / len, z: dir.z / len }, 1);
                player.dimension.spawnParticle("minecraft:knockback_roar_particle", entity.location);
                console.log(entity.typeId);
            }
            player.runCommand(`playsound ability.slash @s`);
        });
    }
}
export class AbilityHandler {
    constructor() {
        AbilityRegistry.register(new FlameBurst());
        AbilityRegistry.register(new WindSlash());
        ComboAbilityManager.bindCombo("R-L-R", "flame_burst");
        ComboAbilityManager.bindCombo("R-R-R", "wind_slash");
    }
}
