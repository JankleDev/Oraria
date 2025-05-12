class StatusEffectEngine {
    constructor(entity) {
        this.entity = entity;
        this.activeEffects = new Map();
        this.immunities = new Set();
        this.resistances = new Map(); // {effectType: percentage}
    }

    // Main processing loop (runs every tick)
    update(deltaTime) {
        const removalQueue = [];
        
        // Process all active effects
        for (const [effectId, effect] of this.activeEffects) {
            // Apply tick damage/buffs
            if (effect.onTick) {
                effect.onTick(this.entity, effect.currentStacks);
            }
            
            // Update duration
            effect.remainingDuration -= deltaTime;
            
            // Queue expired effects
            if (effect.remainingDuration <= 0) {
                removalQueue.push(effectId);
            }
        }
        
        // Clean up finished effects
        removalQueue.forEach(id => this.removeEffect(id));
    }

    // Attempt to apply new effect
    applyEffect(newEffect) {
        // Check immunities
        if (this.immunities.has(newEffect.type)) {
            this.playEffectBlockedFeedback(newEffect);
            return false;
        }
        
        // Calculate resistance reduction
        const resistance = this.resistances.get(newEffect.type) || 0;
        const resistedDuration = newEffect.duration * (1 - resistance);
        
        // Stack or override existing effect
        const existing = this.activeEffects.get(newEffect.id);
        if (existing) {
            return this.handleExistingEffect(existing, newEffect, resistedDuration);
        }
        
        // Apply new effect
        return this.addNewEffect(newEffect, resistedDuration);
    }

    handleExistingEffect(existing, newEffect, resistedDuration) {
        // Stacking logic
        if (newEffect.stackable) {
            const newStacks = Math.min(
                existing.currentStacks + 1,
                newEffect.maxStacks
            );
            
            // Only refresh if stacks increased
            if (newStacks > existing.currentStacks) {
                existing.currentStacks = newStacks;
                existing.remainingDuration = resistedDuration;
                this.playEffectStackedFeedback(newEffect);
                return true;
            }
            
            // Just refresh duration if stacking didn't change
            existing.remainingDuration = Math.max(
                existing.remainingDuration,
                resistedDuration
            );
            return false;
        }
        
        // Override if new effect is stronger
        if (newEffect.priority > existing.priority) {
            this.removeEffect(existing.id);
            return this.addNewEffect(newEffect, resistedDuration);
        }
        
        // Otherwise just refresh duration
        existing.remainingDuration = Math.max(
            existing.remainingDuration,
            resistedDuration
        );
        return false;
    }

    addNewEffect(newEffect, duration) {
        const effectInstance = {
            ...newEffect,
            remainingDuration: duration,
            currentStacks: 1
        };
        
        this.activeEffects.set(newEffect.id, effectInstance);
        
        // Visual and audio feedback
        this.playEffectAppliedFeedback(newEffect);
        
        // Apply immediate effects
        if (newEffect.onApply) {
            newEffect.onApply(this.entity);
        }
        
        return true;
    }

    removeEffect(effectId) {
        const effect = this.activeEffects.get(effectId);
        if (!effect) return;
        
        // Cleanup callback
        if (effect.onRemove) {
            effect.onRemove(this.entity);
        }
        
        // Visual feedback
        this.playEffectRemovedFeedback(effect);
        
        this.activeEffects.delete(effectId);
    }
}