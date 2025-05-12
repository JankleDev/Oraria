

export class PlayerMount {
    constructor(player) {
        this.player = player;
        this.currentMount = null;
        this.unlockedMounts = new Set(['orcaria:basic_horse']);
        this.preferredMount = 'orcaria:basic_horse';
        this.cooldown = 0;
    }

    summonMount(mountType) {
        if (this.cooldown > 0) return false;
        if (!this.unlockedMounts.has(mountType)) return false;
        
        // Cleanup existing mount
        if (this.currentMount) this.dismissMount();
        
        // Spawn new mount
        this.currentMount = this.player.dimension.spawnEntity(
            mountType, 
            this.player.location
        );
        
        // Configure mount
        this.currentMount.addTag('orcaria:player_mount');
        this.currentMount.setDynamicProperty('owner', this.player.id);
        
        // Set up cleanup triggers
        this.currentMount.on('entityRemoved', () => {
            if (this.currentMount === entity) {
                this.currentMount = null;
            }
        });
        
        // Start cooldown
        this.startCooldown();
        return true;
    }

    dismissMount() {
        if (!this.currentMount) return;
        
        // Save mount position for later
        this.lastMountPosition = {
            location: this.currentMount.location,
            dimension: this.currentMount.dimension
        };
        
        // Remove entity
        this.currentMount.triggerEvent('orcaria:despawn');
        this.currentMount = null;
        
        // Short cooldown to prevent spam
        this.startCooldown(2);
    }

    startCooldown(seconds = 5) {
        this.cooldown = seconds;
        
        // Use Minecraft's tick system (20 ticks/sec)
        const interval = setInterval(() => {
            this.cooldown--;
            
            if (this.cooldown <= 0) {
                clearInterval(interval);
            }
        }, 1000);
    }

    isMounted() {
        return this.currentMount !== null && 
               this.currentMount.isValid();
    }

    serialize() {
        return {
            unlockedMounts: Array.from(this.unlockedMounts),
            preferredMount: this.preferredMount,
            lastPosition: this.lastMountPosition
        };
    }

    deserialize(data) {
        this.unlockedMounts = new Set(data.unlockedMounts || []);
        this.preferredMount = data.preferredMount || 'orcaria:basic_horse';
        this.lastMountPosition = data.lastPosition || null;
    }

    playMountEffects() {
        // Circle of runes
        for (let i = 0; i < 360; i += 45) {
            const rad = i * (Math.PI / 180);
            const offset = { x: Math.cos(rad), y: 0.1, z: Math.sin(rad) };
            
            this.player.dimension.spawnParticle(
                "orcaria:mount_rune",
                {
                    x: this.currentMount.location.x + offset.x,
                    y: this.currentMount.location.y,
                    z: this.currentMount.location.z + offset.z
                },
                { x: 0, y: 0.2, z: 0 },
                0.3,
                1
            );
        }

        // Sound effect
        this.player.playSound("random.explode", { pitch: 0.7, volume: 1.5 });
        this.player.playSound("mob.horse.leather", { pitch: 1.2, volume: 1.0 });

        // Mount-specific appearance effects
        switch(this.currentMount.typeId) {
            case "orcaria:horse_basic":
                this.player.dimension.spawnParticle(
                    "orcaria:dust_horse",
                    this.currentMount.location,
                    { x: 0, y: 1, z: 0 },
                    0.8,
                    20
                );
                break;
            case "orcaria:wolf_arcane":
                this.player.dimension.spawnParticle(
                    "orcaria:arcane_sparkles",
                    this.currentMount.location,
                    { x: 0, y: 1, z: 0 },
                    0.5,
                    30
                );
                break;
            // Add other mount types...
        }
    }

    unlockNewMount(mountType) {
        if (!this.unlockedMounts.includes(mountType)) {
            this.unlockedMounts.push(mountType);
            
            // Celebration for new mount
            this.player.sendMessage(`§6§lNEW MOUNT UNLOCKED: §r§f${mountType.split(":")[1].replace(/_/g, " ")}`);
            this.player.playSound("ui.toast.challenge_complete", { volume: 2.0 });
            
            // Fireworks
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    this.player.runCommandAsync(
                        `summon minecraft:fireworks_rocket ${this.player.location.x} ` +
                        `${this.player.location.y} ${this.player.location.z} ` +
                        `{LifeTime:30,FireworksItem:{id:firework_rocket,Count:1,tag:` +
                        `{Fireworks:{Explosions:[{Type:${i % 4},Colors:[I;${Math.floor(Math.random() * 16777215)}],Flicker:1}}}}}`
                    );
                }, i * 500);
            }
        }
    }
}