class ImmunitySystem {
    constructor(entity) {
        this.entity = entity;
        this.permanentImmunities = new Set();
        this.temporaryImmunities = new Map(); // {effectType: expiryTime}
    }

    hasImmunity(effectType) {
        // Check permanent immunities
        if (this.permanentImmunities.has(effectType)) {
            return true;
        }
        
        // Check temporary immunities
        const expiry = this.temporaryImmunities.get(effectType);
        if (expiry && expiry > Date.now()) {
            return true;
        }
        
        // Cleanup if expired
        if (expiry) {
            this.temporaryImmunities.delete(effectType);
        }
        
        return false;
    }

    grantTemporaryImmunity(effectType, duration) {
        this.temporaryImmunities.set(
            effectType, 
            Date.now() + (duration * 1000)
        );
        
        // Visual feedback
        this.playImmunityActivatedFeedback(effectType);
        
        // Return cancel function
        return () => this.temporaryImmunities.delete(effectType);
    }

    playImmunityActivatedFeedback(effectType) {
        const messages = {
            fire: "§6You become impervious to flames!",
            stun: "§bYou gain mental clarity!",
            poison: "§aToxins cannot touch you!"
        };
        
        this.entity.sendMessage(messages[effectType] || `§fYou gain immunity to ${effectType}`);
        
        // Shield-like particle effect
        spawnCircularParticles(this.entity, 2.5, 'witch');
    }
}