export const WorldConfig = {
	SPAWN_LOCATION: { x: 0, y: 5, z: 0 },
	SPAWN_PROTECTION_RADIUS: 50,
	DEFAULT_GAMEMODE: "survival"
};

export const PlayerConfig = {
	STARTING_LEVEL: 1,
	STATS_PER_LEVEL: 2,
	MAX_LEVEL: 50,
	BASE_HEALTH: 100,
	BASE_MANA: 50
};

export const MountConfig = {
	WHISTLE_ITEM: "oraria:mount_whistle",
	SUMMON_COOLDOWN: 5, // seconds
	MAX_DISTANCE: 30, // blocks
	DISMOUNT_RANGE: 10 // blocks
};

export const CommandConfig = {
	PREFIX: "!",
	DEFAULT_PERMISSION: 0,
	ADMIN_PERMISSION: 5
};

export const ServerConfig = {
	VERSION: "1.0.0-beta",
	FORCE_TEST_MODE: false,
	AUTO_SAVE_INTERVAL: 300 // seconds
};
