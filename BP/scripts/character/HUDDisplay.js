export class HUDDisplay {
    constructor(player) {
        this.cachedHealth = -1;
        this.cachedMana = -1;
        this.cachedStamina = -1;
        this.player = player;
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
        const title = `updateHUD:${healthPercent},${manaPercent},${staminaPercent}`;
        this.player.onScreenDisplay.setTitle(title, {
            stayDuration: 1,
            fadeInDuration: 0,
            fadeOutDuration: 0,
            subtitle: ""
        });
    }
}
