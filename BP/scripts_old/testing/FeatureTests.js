

export function registerTests(testRunner, server) {
    testRunner.registerTest('Command System', async () => {
        const fakePlayer = {
            sendMessage: (msg) => console.log(`[TEST] ${msg}`),
            hasTag: () => true,
            isPlayer: true
        };
        
        // Test help command
        server.commandSystem.handleCommand({
            sender: fakePlayer,
            message: '/help'
        });
        
        // Test invalid command
        server.commandSystem.handleCommand({
            sender: fakePlayer,
            message: '/notacommand'
        });
    });

    testRunner.registerTest('RPG Class System', async () => {
        const testPlayer = createTestPlayer();
        const rpgClass = new RPGClass(testPlayer);
        
        // Test level up
        rpgClass.addExperience(1000);
        if (rpgClass.level !== 2) {
            throw new Error('Level up failed');
        }
        
        // Test stat allocation
        const initialStrength = rpgClass.attributes.strength;
        rpgClass.allocateStatPoint('strength');
        if (rpgClass.attributes.strength !== initialStrength + 1) {
            throw new Error('Stat allocation failed');
        }
    });
}