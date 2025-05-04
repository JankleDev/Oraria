class ResistanceSystem {
    constructor(entity) {
        this.entity = entity;
        this.baseResistances = new Map([
            ['fire', 0],
            ['frost', 0],
            ['lightning', 0],
            ['poison', 0],
            ['bleed', 0],
            ['stun', 0]
        ]);
        
        this.temporaryBoosts = new Map(); // {source: {type, amount, expiry}}
    }

    getResistance(effectType) {
        // Base resistance
        let total = this.baseResistances.get(effectType) || 0;
        
        // Add temporary boosts
        for (const [_, boost] of this.temporaryBoosts) {
            if (boost.type === effectType || boost.type === 'all') {
                total += boost.amount;
            }
        }
        
        // Cap at 75% (prevent complete immunity)
        return Math.min(total, 75);
    }

    applyResistance(effect) {
        const resistance = this.getResistance(effect.type);
        if (resistance <= 0) return effect;
        
        // Apply resistance scaling
        const resistedEffect = {...effect};
        resistedEffect.duration = effect.duration * (1 - resistance/100);
        
        // Reduce magnitude for non-duration effects
        if (effect.damagePerTick) {
            resistedEffect.damagePerTick = effect.damagePerTick * (1 - resistance/100);
        }
        
        // Visual feedback
        if (resistance > 15) { // Only show for meaningful resistance
            this.playResistanceFeedback(effect.type, resistance);
        }
        
        return resistedEffect;
    }

    addTemporaryBoost(source, type, amount, duration) {
        const boostId = `${source}-${Date.now()}`;
        this.temporaryBoosts.set(boostId, {
            type,
            amount,
            expiry: Date.now() + (duration * 1000)
        });
        
        // Cleanup expired boosts
        this.cleanExpiredBoosts();
    }

    cleanExpiredBoosts() {
        const now = Date.now();
        for (const [id, boost] of this.temporaryBoosts) {
            if (boost.expiry <= now) {
                this.temporaryBoosts.delete(id);
            }
        }
    }

    playResistanceFeedback(effectType, amount) {
        // Different colors for different resistance levels
        let color;
        if (amount >= 50) color = '§a'; // Green for high resistance
        else if (amount >= 25) color = '§e'; // Yellow for medium
        else color = '§7'; // Gray for low
        
        this.entity.sendMessage(`${color}Resisted ${effectType} by ${amount}%`);
        
        // Particle effect based on element
        const particles = {
            fire: 'flame',
            frost: 'snowball',
            poison: 'slime',
            bleed: 'redstone'
        };
        
        if (particles[effectType]) {
            spawnParticles(this.entity, particles[effectType], amount/10);
        }
    }
}