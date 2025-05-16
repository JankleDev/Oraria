import * as mc from "@minecraft/server";
import { Oraria } from "./Oraria";
// Initialize Oraria when world loads
mc.world.afterEvents.worldLoad.subscribe(() => {
    const oraria = new Oraria(mc.world);
});
