import { Event } from "../core/EventSystem";
export class PlayerInteractEvent extends Event {
    constructor(player, viewDir, action = PlayerInteractEvent.RIGHT_CLICK) {
        super(PlayerInteractEvent.NAME);
        this.player = player;
        this.action = action;
        this.viewDir = viewDir;
    }
    getAction() {
        return this.action;
    }
    getViewDir() {
        return this.viewDir;
    }
}
PlayerInteractEvent.NAME = "PlayerInteractEvent";
PlayerInteractEvent.LEFT_CLICK = 0;
PlayerInteractEvent.RIGHT_CLICK = 1;
