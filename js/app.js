/* ============================================
   APP BOOTSTRAP — Tom's Traveller Tracker
   ============================================ */
const App = (() => {

    // ── Tab Navigation ──
    function initTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                const panel = document.getElementById('panel-' + btn.dataset.tab);
                if (panel) panel.classList.add('active');
            });
        });
    }

    // ── Toast Notifications ──
    function toast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const el = document.createElement('div');
        el.className = `toast toast-${type}`;
        el.textContent = message;
        container.appendChild(el);
        setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 3200);
    }

    // ── Reference Table Renderers ──
    function renderWeaponTable(tableId, data) {
        const el = document.getElementById(tableId);
        if (!el) return;
        el.innerHTML = `<thead><tr><th>Weapon</th><th>TL</th><th>Range</th><th>EP</th><th>Damage</th><th>Traits</th></tr></thead><tbody>` +
            data.map(w => `<tr><td>${w.weapon}</td><td class="mono">${w.tl}</td><td>${w.range}</td><td class="mono">${w.ep}</td><td class="mono">${w.damage}</td><td class="trait">${w.traits}</td></tr>`).join('') +
            `</tbody>`;
    }

    function renderMissileTable(tableId, data) {
        const el = document.getElementById(tableId);
        if (!el) return;
        el.innerHTML = `<thead><tr><th>Warhead</th><th>TL</th><th>Thrust</th><th>Damage</th><th>Traits</th></tr></thead><tbody>` +
            data.map(m => `<tr><td>${m.warhead}</td><td class="mono">${m.tl}</td><td class="mono">${m.thrust}</td><td class="mono">${m.damage}</td><td class="trait">${m.traits}</td></tr>`).join('') +
            `</tbody>`;
    }

    function renderPDTable(tableId, data) {
        const el = document.getElementById(tableId);
        if (!el) return;
        el.innerHTML = `<thead><tr><th>Type</th><th>TL</th><th>Intercept</th><th>EP Required</th></tr></thead><tbody>` +
            data.map(p => `<tr><td>${p.type}</td><td class="mono">${p.tl}</td><td class="mono">${p.intercept}</td><td class="mono">${p.ep}</td></tr>`).join('') +
            `</tbody>`;
    }

    function renderAllReferenceTables() {
        renderWeaponTable('tableWeaponsTurret', GameData.WEAPONS_TURRET);
        renderWeaponTable('tableWeaponsBarbette', GameData.WEAPONS_BARBETTE);
        renderWeaponTable('tableWeaponsBay', GameData.WEAPONS_SMALL_BAY);
        renderMissileTable('tableMissiles', GameData.MISSILES);
        renderMissileTable('tableTorpedoes', GameData.TORPEDOES);
        renderPDTable('tablePDLaser', GameData.POINT_DEFENSE_LASER);
        renderPDTable('tablePDGauss', GameData.POINT_DEFENSE_GAUSS);

        // Screens
        const scrEl = document.getElementById('tableScreens');
        if (scrEl) {
            scrEl.innerHTML = `<thead><tr><th>Screen</th><th>TL</th><th>EP</th><th>Effect</th></tr></thead><tbody>` +
                GameData.SCREENS.map(s => `<tr><td>${s.screen}</td><td class="mono">${s.tl}</td><td class="mono">${s.ep}</td><td>${s.effect}</td></tr>`).join('') + `</tbody>`;
        }

        // Sand Canisters
        const sandEl = document.getElementById('tableSand');
        if (sandEl) {
            sandEl.innerHTML = `<thead><tr><th>Canister</th><th>TL</th><th>Count</th><th>Effect</th></tr></thead><tbody>` +
                GameData.SAND_CANISTERS.map(s => `<tr><td>${s.type}</td><td class="mono">${s.tl}</td><td class="mono">${s.count}</td><td>${s.effect}</td></tr>`).join('') + `</tbody>`;
        }

        // Range Bands
        const rangeEl = document.getElementById('tableRanges');
        if (rangeEl) {
            rangeEl.innerHTML = `<thead><tr><th>Band</th><th>Hexes</th><th>Distance</th><th>Weapons DM</th><th>Sensor DM</th></tr></thead><tbody>` +
                GameData.RANGE_BANDS.map(r => `<tr><td>${r.band}</td><td class="mono">${r.hexes}</td><td>${r.distance}</td><td class="mono">${r.weaponsDM !== null ? (r.weaponsDM >= 0 ? '+' + r.weaponsDM : r.weaponsDM) : 'N/A'}</td><td class="mono">${r.sensorDM !== null ? (r.sensorDM >= 0 ? '+' + r.sensorDM : r.sensorDM) : 'N/A'}</td></tr>`).join('') + `</tbody>`;
        }

        // Asteroids
        const astEl = document.getElementById('tableAsteroids');
        if (astEl) {
            astEl.innerHTML = `<thead><tr><th>Density</th><th>Hex Range</th><th>Pilot Check</th><th>Damage</th></tr></thead><tbody>` +
                GameData.ASTEROID_FIELDS.map(a => `<tr><td>${a.density}</td><td class="mono">${a.hexRange}</td><td class="mono">${a.pilotCheck}</td><td>${a.damage}</td></tr>`).join('') + `</tbody>`;
        }

        // Map Features
        const featEl = document.getElementById('tableFeatures');
        if (featEl) {
            featEl.innerHTML = `<thead><tr><th>Feature</th><th>Pull Distance</th><th>Gravity Effect</th><th>Sensor Mod</th></tr></thead><tbody>` +
                GameData.MAP_FEATURES.map(f => `<tr><td>${f.feature}</td><td class="mono">${f.pull}</td><td>${f.gravity}</td><td class="mono">${f.sensorMod}</td></tr>`).join('') + `</tbody>`;
        }

        // Movement Actions
        const movEl = document.getElementById('tableMovement');
        if (movEl) {
            movEl.innerHTML = `<thead><tr><th>Action</th><th>EP Cost</th><th>Note</th></tr></thead><tbody>` +
                GameData.MOVEMENT_ACTIONS.map(m => `<tr><td>${m.action}</td><td class="mono">${m.ep}</td><td>${m.note}</td></tr>`).join('') + `</tbody>`;
        }

        // G-Force Table
        const gfEl = document.getElementById('tableGForce');
        if (gfEl) {
            gfEl.innerHTML = `<thead><tr><th>Hexes</th><th>G-Level</th><th>END Save</th><th>Base Effect</th><th>G-LOC Failure</th><th>Spin Check</th></tr></thead><tbody>` +
                GameData.GFORCE_TABLE.map(g => `<tr><td class="mono">${g.hexes}</td><td class="mono">${g.gLevel}</td><td class="mono">${g.save}</td><td>${g.effect}</td><td>${g.gloc}</td><td class="mono">${g.spinCheck}</td></tr>`).join('') + `</tbody>`;
        }
    }

    // ── Reset ──
    function initReset() {
        document.getElementById('btnReset')?.addEventListener('click', () => {
            if (confirm('Reset the entire encounter? This will clear all ships, turn state, and crew actions.')) {
                Ships.resetAll();
                Turn.reset();
                Crew.resetActions();
                localStorage.removeItem('ttt_ships');
                localStorage.removeItem('ttt_turn');
                Turn.render();
                Turn.updateTurnCounter();
                toast('Encounter reset.', 'info');
            }
        });
    }

    // ── Init ──
    function init() {
        initTabs();
        Ships.init();
        Turn.init();
        Power.init();
        Combat.init();
        Crits.init();
        Crew.init();
        renderAllReferenceTables();
        initReset();
    }

    document.addEventListener('DOMContentLoaded', init);

    return { toast };
})();
