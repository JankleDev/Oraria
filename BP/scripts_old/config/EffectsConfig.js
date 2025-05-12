// Example: Bleeding Effect
const BLEED_EFFECT = {
    id: "bleed",
    type: "physical",
    name: "Bleeding",
    icon: "textures/ui/bleed_icon",
    color: 0xFF0000,
    duration: 8,
    stackable: true,
    maxStacks: 5,
    priority: 2,
    
    // Gameplay
    onApply: (target) => {
        target.sendMessage("§cYou start bleeding!");
        spawnBloodParticles(target);
    },
    
    onTick: (target, stacks) => {
        // Damage per tick scales with stacks
        const damage = stacks * 1.5;
        target.takeDamage(damage, "physical");
        
        // Visual feedback
        spawnBloodDrops(target);
    },
    
    onRemove: (target) => {
        target.sendMessage("§aYour bleeding stops");
    },
    
    // UI
    getDescription: (stacks) => {
        return `§cBleeding (${stacks}): ${(stacks * 1.5).toFixed(1)} damage per second`;
    }
};

// Example: Haste Buff
const HASTE_BUFF = {
    id: "haste",
    type: "buff",
    name: "Haste",
    icon: "textures/ui/haste_icon",
    color: 0x00FF00,
    duration: 15,
    stackable: false,
    priority: 1,
    
    onApply: (target) => {
        target.movementSpeed *= 1.3;
        target.sendMessage("§aYou feel faster!");
    },
    
    onRemove: (target) => {
        target.movementSpeed /= 1.3;
        target.sendMessage("§7Your haste wears off");
    },
    
    getDescription: () => "§a+30% Movement Speed"
};