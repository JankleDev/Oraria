import { system } from "@minecraft/server";
export class HUDDisplay {
    constructor(player) {
        this.inputHistory = [];
        this.cachedHealth = -1;
        this.cachedMana = -1;
        this.cachedStamina = -1;
        this.player = player;
    }
    pushInput(input) {
        if (this.inputHistory.length === 3) {
            // Reset once combo is full
            this.inputHistory = [];
        }
        this.inputHistory.push(input);
        system.run(() => {
            this.displayHUD();
        });
    }
    update({ health, maxHealth, mana, maxMana, stamina, maxStamina }) {
        const healthPercent = health !== undefined && maxHealth !== undefined
            ? Math.round((health / maxHealth) * 100)
            : this.cachedHealth;
        const manaPercent = mana !== undefined && maxMana !== undefined ? Math.round((mana / maxMana) * 100) : this.cachedMana;
        const staminaPercent = stamina !== undefined && maxStamina !== undefined
            ? Math.round((stamina / maxStamina) * 100)
            : this.cachedStamina;
        if (healthPercent === this.cachedHealth &&
            manaPercent === this.cachedMana &&
            staminaPercent === this.cachedStamina)
            return;
        this.cachedHealth = healthPercent;
        this.cachedMana = manaPercent;
        this.cachedStamina = staminaPercent;
        this.displayHUD();
    }
    displayHUD() {
        const title = `updateHUD:${this.cachedHealth}, ${this.cachedMana}, ${this.cachedStamina}`;
        // Fill remaining slots with '?'
        const padded = [...this.inputHistory];
        while (padded.length < 3)
            padded.push("?");
        const subtitle = "§a" + padded.join(" - ");
        this.player.onScreenDisplay.setTitle(title, {
            stayDuration: 4,
            fadeInDuration: 2,
            fadeOutDuration: 1,
            subtitle
        });
    }
}
