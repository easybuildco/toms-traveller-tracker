/* ============================================
   RULES DATA — Traveller Space Combat v6.5
   Tom's Traveller Tracker
   ============================================ */

const GameData = (() => {

    // ── Turn Sequence ──────────────────────────
    const TURN_PHASES = [
        {
            id: 'tactics',
            name: 'Tactics Step',
            color: 'var(--phase-tactics)',
            icon: '🎯',
            steps: [
                { id: 'initiative', name: 'Determine Initiative Order', desc: 'Tactics (Naval) 8+. Add Effect. Highest picks to go First (high→low) or Last (low→high).' },
                { id: 'power', name: 'Power Allocation', desc: 'Allocate Energy Points (EP) to systems and actions in initiative order.' },
                { id: 'sensors', name: 'Sensor Checks', desc: 'Choose sensor mode (Passive/Active/ECM). Allocate software programs.' },
                { id: 'targetlocks', name: 'Target Locks', desc: 'Establish target locks (1 EP per target, +4 DM). Overt act — automatically detected.' },
                { id: 'ecm', name: 'ECM vs Existing Locks', desc: 'Sensor Operator can attempt to break a pre-existing targeting lock from the previous turn (Opposed, −2 DM).' },
            ]
        },
        {
            id: 'maneuver',
            name: 'Maneuver Step',
            color: 'var(--phase-maneuver)',
            icon: '🚀',
            steps: [
                { id: 'movement', name: 'Ship Movement', desc: 'Apply Velocity first, then Thrust. Thrust ≤ allocated EP.' },
                { id: 'gforce', name: 'G-Force Effects', desc: 'All crew make Endurance Save based on total hexes moved. Check for G-LOC and Spin.' },
            ]
        },
        {
            id: 'attack',
            name: 'Attack Step',
            color: 'var(--phase-attack)',
            icon: '⚔️',
            steps: [
                { id: 'ordnance_move', name: 'Move In-Flight Ordnance', desc: 'Move existing missile and torpedo salvos.' },
                { id: 'ordnance_launch', name: 'Launch New Ordnance', desc: 'Fire new missile and torpedo salvos.' },
                { id: 'ordnance_attack', name: 'Ordnance Attacks & Reactions', desc: 'Resolve ordnance attacks. Defender reacts with Point Defense / ECM / Evade.' },
                { id: 'directfire', name: 'Direct Fire Attacks', desc: 'Make direct fire attacks.' },
                { id: 'directfire_react', name: 'Direct Fire Reactions', desc: 'Defender reacts with Screens / Sand Casters / Evade.' },
                { id: 'resolve_damage', name: 'Resolve Damage', desc: 'Apply damage, check for critical hits.' },
            ]
        },
        {
            id: 'crew',
            name: 'Crew Actions Step',
            color: 'var(--phase-crew)',
            icon: '👥',
            steps: [
                { id: 'crew_actions', name: 'Crew Actions (Limit 6)', desc: 'Distribute up to 6 actions among crew (including previous actions above).' },
            ]
        },
    ];

    // ── Difficulty Levels ──────────────────────
    const DIFFICULTIES = {
        'Simple': 2,
        'Easy': 4,
        'Routine': 6,
        'Average': 8,
        'Difficult': 10,
        'Very Difficult': 12,
        'Formidable': 14,
        'Impossible': 16,
    };

    // ── Range Bands ────────────────────────────
    const RANGE_BANDS = [
        { band: 'Close', hexes: '0', distance: '<5,000 km', weaponsDM: +2, sensorDM: +2 },
        { band: 'Short', hexes: '1', distance: '5,000 km', weaponsDM: +2, sensorDM: +2 },
        { band: 'Medium', hexes: '2-4', distance: '5,001–10,000 km', weaponsDM: 0, sensorDM: 0 },
        { band: 'Long', hexes: '5-10', distance: '10,001–25,000 km', weaponsDM: 0, sensorDM: 0 },
        { band: 'Very Long', hexes: '11-20', distance: '25,001–50,000 km', weaponsDM: -2, sensorDM: -2 },
        { band: 'Distant', hexes: '21-36', distance: '50,000–300,000 km', weaponsDM: -4, sensorDM: -4 },
        { band: 'Extreme', hexes: '37+', distance: '300,000–5mil km', weaponsDM: null, sensorDM: -6 },
        { band: 'Far', hexes: '1000+', distance: 'Over 5mil km', weaponsDM: null, sensorDM: null },
    ];

    // ── Sensor Modes ───────────────────────────
    const SENSOR_MODES = [
        { mode: 'Passive', ep: 0, dm: '-2 / -4 vs Stealth', detectionRisk: '0' },
        { mode: 'Active', ep: 1, dm: '0 / -2 vs Stealth', detectionRisk: '+2 Enemy Sensor' },
        { mode: 'ECM', ep: 1, dm: 'Allows ECM', detectionRisk: '0' },
        { mode: 'Target Lock', ep: '1/target', dm: '+4 DM for attacks', detectionRisk: 'Automatic' },
    ];

    // ── Sensor Grades ──────────────────────────
    const SENSOR_GRADES = [
        { grade: 'Civilian', tl: 'TL7-9', maxLocks: 1, example: 'Single target — basic detection/fire control' },
        { grade: 'Military', tl: 'TL10-12', maxLocks: '2-3', example: 'Track 2-3 targets; military standard' },
        { grade: 'Advanced', tl: 'TL13-15', maxLocks: '4+', example: 'Multi-threat military grade sensor array' },
    ];

    // ── Power Allocation Systems ───────────────
    const POWER_SYSTEMS = [
        { system: 'M-Drive', epReq: '1 EP per Thrust made available' },
        { system: 'J-Drive', epReq: 'Per ship stats' },
        { system: 'Life Support', epReq: '1 per 10 crew members' },
        { system: 'Sensors', epReq: '1 per Sensor (ECM additional)' },
        { system: 'Weapons', epReq: '1 per Turret + Weapon System Power' },
        { system: 'Screens', epReq: 'Per type (HG p. 41)' },
        { system: 'Reactions', epReq: 'Allocate EP reserved for reactions' },
    ];

    // ── Movement Actions ───────────────────────
    const MOVEMENT_ACTIONS = [
        { action: 'Acceleration', ep: '1 per hex', note: 'Forward only' },
        { action: 'Deceleration', ep: '1 per decel', note: 'Stops Acceleration' },
        { action: 'Turn 60°', ep: '1 + ⌊Speed/3⌋', note: 'One hex facing' },
        { action: 'Sideways Vector', ep: '2', note: 'One hex to side' },
        { action: 'Aid Gunners', ep: '1', note: 'Pilot/Gunner task chain' },
        { action: 'Docking', ep: '1', note: 'Same hex' },
    ];

    // ── G-Force Table ──────────────────────────
    const GFORCE_TABLE = [
        { hexes: '1-3', gLevel: '1-2', save: 'Easy (4+)', effect: '-1 DM to all tasks', gloc: 'None', spinCheck: 'No' },
        { hexes: '4-6', gLevel: '3-5', save: 'Routine (6+)', effect: '-1 DM to all tasks', gloc: 'Incapacitated for rest of turn', spinCheck: 'No' },
        { hexes: '7-8', gLevel: '6-9', save: 'Average (8+)', effect: '-2 DM to all tasks', gloc: 'Incapacitated 2 turns', spinCheck: 'Average (8+)' },
        { hexes: '9-10', gLevel: '10+', save: 'Difficult (10+)', effect: '-2 DM to all tasks', gloc: 'Incapacitated 2 turns + 1D damage', spinCheck: 'Difficult (10+)' },
        { hexes: '11+', gLevel: '11+', save: 'Very Difficult (12+)', effect: '-4 DM to all tasks', gloc: 'Incapacitated 3 rounds + 3D damage', spinCheck: 'Very Difficult (12+)' },
    ];

    // ── Map Terrain ────────────────────────────
    const ASTEROID_FIELDS = [
        { density: 'Light', hexRange: '2-4', pilotCheck: '8+', damage: '1D + 1D per 2 hexes of movement speed' },
        { density: 'Medium', hexRange: '5-8', pilotCheck: '10+', damage: '2D + 1D per 2 hexes of movement speed' },
        { density: 'Heavy', hexRange: '8-10', pilotCheck: '12+', damage: '3D + 1D per 2 hexes of movement speed' },
    ];

    const MAP_FEATURES = [
        { feature: 'Gas Giant', pull: '12 hexes', gravity: 'Pull 1 (Thrust 1 to counter)', sensorMod: '-1 Sensors' },
        { feature: 'Planet', pull: '8 hexes', gravity: 'Pull 1 (Thrust 1 to counter)', sensorMod: '-1 Sensors' },
    ];

    // ── Attack Modifiers ───────────────────────
    const ATTACK_MODIFIERS = [
        { modifier: 'Target Size — Large (5,001-50,000t)', dm: '+2' },
        { modifier: 'Target Size — Very Large (50,001t+)', dm: '+4' },
        { modifier: 'Relative Target Speed (5+ diff)', dm: '-2' },
        { modifier: 'Target Evasive', dm: '-1 per EP (max -3)' },
        { modifier: 'Firing Arc (outside arc)', dm: '-2' },
        { modifier: 'Fire Control Computer/n', dm: '+n' },
        { modifier: 'Target Computer programs (Evade)', dm: 'Per program' },
        { modifier: 'Called Shot (short range or less)', dm: '-2' },
    ];

    // ── Weapons: Turrets & Fixed Mounts (x1 Damage) ──
    const WEAPONS_TURRET = [
        { weapon: 'Beam Laser', tl: 10, range: 'Med (2-4)', ep: 4, damage: '1D', traits: '—' },
        { weapon: 'Pulse Laser', tl: 9, range: 'Long (5-10)', ep: 4, damage: '2D', traits: '—' },
        { weapon: 'Missile Rack', tl: 7, range: 'Per Wpn', ep: 0, damage: 'Per Wpn', traits: 'Smart' },
        { weapon: 'Fusion Gun', tl: 14, range: 'Med (2-4)', ep: 12, damage: '4D', traits: 'Radiation' },
        { weapon: 'Laser Drill', tl: 8, range: 'Close (0-Same Hex)', ep: 4, damage: '2D', traits: 'AP 4' },
        { weapon: 'Particle Beam', tl: 12, range: 'Very Long (11-20)', ep: 8, damage: '3D', traits: 'Radiation' },
        { weapon: 'Railgun', tl: 10, range: 'Short (1)', ep: 2, damage: '2D', traits: 'AP 4' },
        { weapon: 'Sand Caster', tl: 9, range: 'Special', ep: 0, damage: 'Special', traits: '—' },
    ];

    // ── Weapons: Barbettes (x3 Damage) ─────────
    const WEAPONS_BARBETTE = [
        { weapon: 'Beam Laser', tl: 10, range: 'Med (2-4)', ep: 12, damage: '2D', traits: '—' },
        { weapon: 'Fusion', tl: 12, range: 'Med (2-4)', ep: 20, damage: '5D', traits: 'AP 3, Radiation' },
        { weapon: 'Ion Cannon', tl: 12, range: 'Med (2-4)', ep: 10, damage: '7D (HG p.30)', traits: 'Ion' },
        { weapon: 'Missile', tl: 7, range: 'Per Wpn', ep: 0, damage: 'Per Wpn', traits: 'Smart' },
        { weapon: 'Particle Beam', tl: 11, range: 'Very Long (11-20)', ep: 12, damage: '4D', traits: 'Radiation' },
        { weapon: 'Plasma', tl: 11, range: 'Medium (2-4)', ep: 12, damage: '4D', traits: 'AP 2' },
        { weapon: 'Pulse Laser', tl: 9, range: 'Long (5-10)', ep: 12, damage: '3D', traits: '—' },
        { weapon: 'Torpedo', tl: 7, range: 'Per Wpn', ep: 2, damage: 'Per Wpn', traits: 'Smart' },
    ];

    // ── Weapons: Small Bay (x10 Damage) ────────
    const WEAPONS_SMALL_BAY = [
        { weapon: 'Fusion', tl: 12, range: 'Med (2-4)', ep: 50, damage: '6D', traits: 'AP 6, Radiation' },
        { weapon: 'Ion Cannon', tl: 12, range: 'Med (2-4)', ep: 20, damage: '6D (HG p.30)', traits: 'Ion' },
        { weapon: 'Mass Driver', tl: 8, range: 'Short (1)', ep: 15, damage: '3D', traits: 'Orbital Bombardment' },
        { weapon: 'Meson', tl: 11, range: 'Long (5-10)', ep: 20, damage: '5D', traits: 'Ignore armor, Radiation' },
        { weapon: 'Missile Bay', tl: 7, range: 'Per Wpn', ep: 5, damage: 'Per Wpn', traits: 'Smart' },
        { weapon: 'Orbital Strike Mass Driver', tl: 10, range: 'Short (1)', ep: 35, damage: '7D', traits: 'Orbital Strike' },
        { weapon: 'Orbital Strike Missile Bay', tl: 10, range: 'Med (2-4)', ep: 5, damage: '3D', traits: 'Orbital Strike' },
        { weapon: 'Particle Beam', tl: 11, range: 'Very Long (5-10)', ep: 30, damage: '6D', traits: 'Radiation' },
        { weapon: 'Railgun', tl: 10, range: 'Short (1)', ep: 10, damage: '3D', traits: 'AP 10' },
        { weapon: 'Repulsor', tl: 15, range: 'Short (1)', ep: 50, damage: 'HG p.34', traits: '—' },
        { weapon: 'Torpedo', tl: 7, range: 'Per Wpn', ep: 2, damage: 'Per Wpn', traits: 'Smart' },
    ];

    // ── Missile Salvos ─────────────────────────
    const MISSILES = [
        { warhead: 'Standard', tl: 7, thrust: 10, damage: '4D', traits: 'Smart' },
        { warhead: 'Advanced', tl: 14, thrust: 15, damage: '5D', traits: 'Smart' },
        { warhead: 'Antimatter', tl: 20, thrust: 15, damage: '2DD', traits: 'Radiation, Smart' },
        { warhead: 'Anti-Torpedo', tl: 13, thrust: 15, damage: '1D', traits: 'Smart' },
        { warhead: 'Decoy', tl: 9, thrust: 15, damage: '2D', traits: 'Smart' },
        { warhead: 'Frag', tl: 8, thrust: 15, damage: '3D', traits: 'Smart' },
        { warhead: 'Ion', tl: 12, thrust: 12, damage: 'See HG p.30', traits: 'Ion' },
        { warhead: 'Jump Breaker', tl: 13, thrust: 10, damage: 'See HG p.37', traits: 'Smart' },
        { warhead: 'Long Range', tl: 8, thrust: 15, damage: '3D', traits: 'Smart' },
        { warhead: 'Multi-Warhead', tl: 8, thrust: 10, damage: '3D', traits: 'Smart' },
        { warhead: 'Nuclear', tl: 6, thrust: 10, damage: '1DD', traits: 'Radiation, Smart' },
        { warhead: 'Ortillery', tl: 7, thrust: 6, damage: '1DD', traits: 'Orbital Strike' },
        { warhead: 'Shockwave', tl: 7, thrust: 10, damage: '4D', traits: 'Smart' },
    ];

    // ── Torpedo Salvos ─────────────────────────
    const TORPEDOES = [
        { warhead: 'Standard', tl: 7, thrust: 10, damage: '6D', traits: 'Smart' },
        { warhead: 'Advanced', tl: 14, thrust: 15, damage: '7D', traits: 'Smart' },
        { warhead: 'Antimatter', tl: 20, thrust: 10, damage: '3DD', traits: 'Radiation, Smart' },
        { warhead: 'Antimatter Bomb-Pumped', tl: 21, thrust: 10, damage: '8D', traits: 'AP 10, Radiation, Smart' },
        { warhead: 'Antiradiation', tl: 12, thrust: 10, damage: '6D', traits: 'Smart' },
        { warhead: 'Bomb-Pumped', tl: 9, thrust: 10, damage: '4D', traits: 'Smart' },
        { warhead: 'Ion', tl: 9, thrust: 10, damage: 'See HG p.39', traits: 'Smart' },
        { warhead: 'Multi-Warhead Antimatter', tl: 21, thrust: 10, damage: '1DD', traits: 'Radiation, Smart' },
        { warhead: 'Multi-Warhead Standard', tl: 8, thrust: 10, damage: '4D', traits: 'Smart' },
        { warhead: 'Multi-Warhead Nuclear', tl: 8, thrust: 10, damage: '2DD', traits: 'Radiation, Smart' },
        { warhead: 'Nuclear', tl: 7, thrust: 10, damage: '2DD', traits: 'Radiation, Smart' },
        { warhead: 'Ortillery', tl: 8, thrust: 6, damage: '3DD', traits: 'Orbital Strike' },
        { warhead: 'Plasma', tl: 12, thrust: 10, damage: '1DD', traits: 'AP 10, Smart' },
    ];

    // ── Point Defense Batteries ────────────────
    const POINT_DEFENSE_LASER = [
        { type: 'Type I', tl: 10, intercept: '+2D', ep: 10 },
        { type: 'Type II', tl: 12, intercept: '+4D', ep: 20 },
        { type: 'Type III', tl: 14, intercept: '+6D', ep: 30 },
    ];

    const POINT_DEFENSE_GAUSS = [
        { type: 'Type I', tl: 10, intercept: '+2D', ep: 5 },
        { type: 'Type II', tl: 12, intercept: '+4D', ep: 15 },
        { type: 'Type III', tl: 14, intercept: '+6D', ep: 25 },
    ];

    // ── Screens ────────────────────────────────
    const SCREENS = [
        { screen: 'Meson Screen', tl: 13, ep: 30, effect: 'Damage from meson weapons reduced by 2D × 10, removes radiation trait' },
        { screen: 'Nuclear Dampener', tl: 12, ep: 20, effect: 'Reduces damage from fusion/nuclear by 2D, removes radiation trait' },
    ];

    // ── Sand Caster Canisters ──────────────────
    const SAND_CANISTERS = [
        { type: 'Standard', tl: 7, count: 20, effect: '1D + EFFECT adds to armor vs beam weapons' },
        { type: 'Anti-Personnel', tl: 8, count: 20, effect: '3D damage + EFFECT (ground scale) vs personnel. Range: SHORT' },
        { type: 'Flares/Chaff', tl: 8, count: 20, effect: 'DM −1 vs sensor checks and missile/torpedo attacks' },
        { type: 'Pebble', tl: 7, count: 20, effect: '1DD damage + EFFECT (ground scale) vs boarders. Boarding range only' },
        { type: 'Sand Cutter', tl: 8, count: 20, effect: '½ protection to enemy sand cloud. Range: SHORT' },
    ];

    // ── Critical Hit Location (2D) ─────────────
    const CRIT_LOCATIONS = [
        { roll: 2, location: 'Sensors' },
        { roll: 3, location: 'Power Plant' },
        { roll: 4, location: 'Fuel' },
        { roll: 5, location: 'Weapon' },
        { roll: 6, location: 'Armor' },
        { roll: 7, location: 'Hull' },
        { roll: 8, location: 'Maneuver Drive' },
        { roll: 9, location: 'Cargo Hold' },
        { roll: 10, location: 'Jump Drive' },
        { roll: 11, location: 'Crew' },
        { roll: 12, location: 'Bridge' },
    ];

    // ── Critical Hit Effects ───────────────────
    const CRIT_EFFECTS = {
        'Sensors': [
            'DM −2',
            'Inoperative beyond Med range',
            'Inoperative beyond Short range',
            'Inoperative beyond Close range',
            'Close range only, DM −2',
            'Disabled',
        ],
        'Power Plant': [
            'Power reduced 10%',
            'Power reduced by 20%',
            'Power reduced by 50%',
            'Power reduced to 0',
            'Hull severity increased by 1. 0 Power.',
            'Hull severity increased by 1D. 0 Power.',
        ],
        'Fuel': [
            'Leak — lose 1D tons/hour',
            'Leak — lose 1D tons/round',
            'Leak — lose 1D × 10% of fuel',
            'Fuel tank destroyed',
            'Fuel tank destroyed, Hull severity +1',
            'Fuel tank destroyed, Hull severity +1D',
        ],
        'Weapon': [
            'Random weapon degraded — DM −1',
            'Random weapon disabled',
            'Random weapon destroyed',
            'Random weapon destroyed. Hull Severity +1',
            '1D3 random weapons destroyed, Hull severity +1',
            '1D random weapons destroyed, Hull severity +1',
        ],
        'Armor': [
            'Armor reduced by −1',
            'Armor reduced by 1D3',
            'Armor reduced by −1D',
            'Armor reduced by −1D',
            'Armor reduced by −2D, Hull Severity +1',
            'Armor reduced by −2D, Hull Severity +1',
        ],
        'Hull': [
            '1D extra damage',
            '2D extra damage',
            '3D extra damage',
            '4D extra damage',
            '5D extra damage',
            '6D extra damage',
        ],
        'Maneuver Drive': [
            'All checks DM −1',
            'All checks DM −1. Thrust −1.',
            'All checks DM −1. Thrust −1.',
            'All checks DM −1. Thrust −1.',
            'Thrust reduced to 0',
            'Thrust reduced to 0. Hull severity +1',
        ],
        'Cargo Hold': [
            '10% Cargo destroyed',
            '1D × 10% Cargo destroyed',
            '2D × 10% Cargo destroyed',
            'All cargo destroyed',
            'All cargo destroyed. Hull severity +1',
            'All cargo destroyed. Hull severity +1',
        ],
        'Jump Drive': [
            'DM −2 to Jump Checks',
            'Jump Drive disabled',
            'Jump Drive destroyed',
            'Jump Drive destroyed. Hull severity +1',
            'Jump Drive destroyed. Hull severity +1',
            'Jump Drive destroyed. Hull severity +1',
        ],
        'Crew': [
            'Random Crew member takes 1D damage',
            'Life Support fails in 1D hours',
            '1D occupants take 2D damage',
            'Life Support fails within 1D rounds',
            'All occupants take 3D damage',
            'Life support fails',
        ],
        'Bridge': [
            'Random Bridge Station Disabled (1-2: Sensors, 3-4: Comm, 5-6: Avionics)',
            'Computer reboots; all software unavailable this round and next',
            'Computer damaged, reduced bandwidth 50%',
            'Random Bridge Station destroyed. Occupant takes 1D × 1D damage',
            'Computer destroyed',
            'Random Bridge Station destroyed. Occupant takes 1D × 1D damage. Hull severity +1',
        ],
    };

    // ── Crew Actions ───────────────────────────
    const CREW_ACTIONS = [
        { action: 'Emergency Jump', role: 'Astrogation & Engineer', difficulty: 'Difficult (10+)', desc: 'Successful Astrogation and jump drive emergency jump. Jump can be made next maneuver step.' },
        { action: 'Overload Drive', role: 'Engineer', difficulty: 'Difficult (10+) [M-Drive]', desc: 'Increases Thrust by 1 next maneuver step. Effect of −6 causes Severity 1 crit to drive.' },
        { action: 'Overload Plant', role: 'Engineer', difficulty: 'Difficult (10+) [M-Drive]', desc: 'Increases power +10% next maneuver step. Effect of −6 causes Severity 1 crit to plant. Cumulative DM −2.' },
        { action: 'Offline System', role: 'Engineer (Power)', difficulty: 'Engineer check', desc: 'Shut down systems to reduce EP requirements. 1 round to bring back online.' },
        { action: 'Repair System', role: 'Engineer', difficulty: 'Average (8+)', desc: 'Repair critical hit. DM = −severity. Cumulative DM +1 per round working. Reduces severity by 1. Lasts 1D hours.' },
        { action: 'Repair Drone', role: 'Electronics (Remote Ops)', difficulty: 'Varies', desc: 'Employ a repair drone to use the Repair Systems reaction.' },
        { action: 'Reload Turret', role: 'Gunner', difficulty: 'Easy (4+)', desc: 'Reload munitions for missiles/torpedoes/sand casters/railguns in a turret or barbette.' },
        { action: 'Boarding Action', role: 'Marine', difficulty: 'Varies', desc: 'If two ships are adjacent, launch a boarding party to storm an enemy ship.' },
        { action: 'Reassignment', role: 'Any', difficulty: 'None', desc: 'Change role on ship. Transfer takes one step to complete.' },
    ];

    // ── Weapon Mount Types ─────────────────────
    const MOUNT_TYPES = [
        { mount: 'Turret/Barbette', arc: 'All Directions' },
        { mount: 'Bay', arc: 'Forward/Aft/Port/Side — Per Ship Design' },
        { mount: 'Spinal', arc: 'Forward only' },
    ];

    // ── Hull Breach Rule ───────────────────────
    const HULL_BREACH_LOCATIONS = ['Hull', 'Power Plant', 'Maneuver Drive', 'Cargo Hold', 'Crew', 'Bridge'];
    const HULL_BREACH_DAMAGE = '3D damage per round to unprotected crew until protected from vacuum';

    return {
        TURN_PHASES, DIFFICULTIES, RANGE_BANDS,
        SENSOR_MODES, SENSOR_GRADES, POWER_SYSTEMS,
        MOVEMENT_ACTIONS, GFORCE_TABLE,
        ASTEROID_FIELDS, MAP_FEATURES,
        ATTACK_MODIFIERS, MOUNT_TYPES,
        WEAPONS_TURRET, WEAPONS_BARBETTE, WEAPONS_SMALL_BAY,
        MISSILES, TORPEDOES,
        POINT_DEFENSE_LASER, POINT_DEFENSE_GAUSS,
        SCREENS, SAND_CANISTERS,
        CRIT_LOCATIONS, CRIT_EFFECTS,
        CREW_ACTIONS,
        HULL_BREACH_LOCATIONS, HULL_BREACH_DAMAGE,
    };
})();
