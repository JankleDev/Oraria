class ComboSystem {
    constructor(entity) {
        this.entity = entity;
        this.activeElements = new Map(); // {element: expiry}
        this.comboTable = this.initComboTable();
    }

    initComboTable() {
        return {
            // Elemental Combos
            'fire→frost': {
                result: 'steam',
                damage: 1.5,
                effect: (target) => target.addEffect(BLIND_EFFECT)
            },
            'frost→lightning': {
                result: 'shatter',
                damage: 2.0,
                effect: (target) => target.addEffect(ARMOR_BREAK_EFFECT)
            },
            
            // Physical Combos
            'bleed→poison': {
                result: 'septic',
                damage: 1.8,
                effect: (target) => target.addEffect(HEALING_REDUCTION_EFFECT)
            },
            
            // Mixed Combos
            'fire→poison': {
                result: 'explosive',
                damage: 2.2,
                effect: (target) => target.addEffect(BURNING_EFFECT)
            }
        };
    }

    applyElement(element) {
        // Check for existing elements to combo with
        for (const [existingElement, expiry] of this.activeElements) {
            if (Date.now() > expiry) continue;
            
            const comboKey = `${existingElement}→${element}`;
            if (this.comboTable[comboKey]) {
                this.triggerCombo(comboKey);
                this.activeElements.delete(existingElement);
                return true;
            }
        }
        
        // Add new element if no combo
        this.activeElements.set(element, Date.now() + 3000);
        return false;
    }

    triggerCombo(comboKey) {
        const combo = this.comboTable[comboKey];
        
        // Visual spectacle
        this.playComboEffects(combo.result);
        
        // Apply combo effect
        if (combo.effect) {
            combo.effect(this.entity);
        }
        
        // Damage multiplier
        this.entity.lastDamageDealt *= combo.damage;
        
        // Announcement
        this.entity.sendMessage(`§6§lCOMBO! ${combo.result.toUpperCase()}`);
    }

    playComboEffects(comboType) {
        const effects = {
            steam: {
                particle: 'bubble_column_up',
                sound: 'random.fizz',
                color: 0x88CCFF
            },
            shatter: {
                particle: 'item_snowball',
                sound: 'random.glass',
                color: 0xFFFFFF
            },
            explosive: {
                particle: 'explosion',
                sound: 'random.explode',
                color: 0xFF8800
            }
        };
        
        const comboFx = effects[comboType];
        if (comboFx) {
            spawnParticles(this.entity, comboFx.particle, 30);
            this.entity.playSound(comboFx.sound);
        }
    }
}