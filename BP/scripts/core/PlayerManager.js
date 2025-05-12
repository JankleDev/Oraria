var _a;
import { world } from "@minecraft/server";
import { RPGPlayer } from "../character/RPGPlayer";
import { Errors } from "../util/Errors";
import { Oraria } from "../Oraria";
export class PlayerManager {
    /**
     * Gets an RPGPlayer by reference (Player object or player ID)
     * @param playerRef Player object or player ID
     * @returns RPGPlayer or null if not found, or error if invalid reference
     */
    static get(playerRef) {
        if (typeof playerRef === "string") {
            // Get by player ID
            return this.players.get(playerRef) ?? null;
        }
        else if (playerRef?.id) {
            // Get by Player object
            return this.players.get(playerRef.id) ?? null;
        }
        console.warn(Errors.FAILED_PLAYER_REF_SEARCH + JSON.stringify(playerRef, null, 2));
        return null;
    }
    /**
     * Gets all RPGPlayers
     * @returns Array of all RPGPlayers
     */
    static getAll() {
        return Array.from(this.players.values());
    }
}
_a = PlayerManager;
PlayerManager.players = new Map();
(() => {
    world.afterEvents.playerSpawn.subscribe(async (eventData) => {
        const { player, initialSpawn } = eventData;
        if (!initialSpawn)
            return;
        try {
            const rpgPlayer = new RPGPlayer(player);
            const before = Date.now();
            const data = await Oraria.playerStorage.getPlayerData(rpgPlayer, true);
            const after = Date.now();
            rpgPlayer.initEntity(data);
            Oraria.entityHandler.registerEntity(rpgPlayer);
            _a.players.set(player.id, rpgPlayer);
            console.warn("took: " + (after - before));
        }
        catch (error) {
            console.warn(`Failed to init player ${player.name}: ${error}`);
        }
    });
    world.beforeEvents.playerLeave.subscribe((eventData) => {
        const playerId = eventData.player.id;
        const rpgPlayer = _a.get(playerId);
        rpgPlayer?.onLeave();
        _a.players.delete(playerId);
    });
})();
