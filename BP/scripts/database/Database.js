import { PlayerStorage } from "./PlayerStorage";
// import { EconomySystem } from "./EconomySystem";
// import { WorldDataSystem } from "./WorldDataSystem";
export class Database {
    // private readonly economy: EconomySystem;
    // private readonly worldData: WorldDataSystem;
    constructor() {
        this.playerStorage = new PlayerStorage();
        // Uncomment when implementing
        // this.economy = new EconomySystem(this.getStorage());
        // this.worldData = new WorldDataSystem(this.getStorage());
    }
    /**
     * Initialize all async database systems
     */
    /*public async initialize(): Promise<void> {
        try {
            await this.playerStorage.initialize();
            // await this.economy.initialize();
            // await this.worldData.initialize();
        } catch (error) {
            console.error("[Database] Initialization failed:", error);
        }
    }*/
    /**
     * Save all critical data to persistent storage
     */
    saveAll() {
        try {
            this.playerStorage.saveAll();
            // this.economy.saveAll();
            // this.worldData.save();
        }
        catch (error) {
            console.error("[Database] Save failed:", error);
        }
    }
}
