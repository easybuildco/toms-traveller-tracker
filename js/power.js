/* ============================================
   POWER ALLOCATION
   Tom's Traveller Tracker
   ============================================ */

const Power = (() => {

    function render(shipId) {
        const panel = document.getElementById('powerPanel');
        if (!panel) return;

        if (!shipId) {
            panel.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⚡</div>
                    <p>Select a ship to allocate power.</p>
                </div>`;
            return;
        }

        const ship = Ships.getShip(shipId);
        if (!ship) return;

        const alloc = ship.powerAllocation || {};
        const systems = [
            { key: 'mdrive', name: 'M-Drive', desc: '1 EP per Thrust', max: ship.thrustMax * 2, val: alloc.mdrive || 0 },
            { key: 'jdrive', name: 'J-Drive', desc: 'Per ship stats', max: Math.floor(ship.powerMax * 0.4), val: alloc.jdrive || 0 },
            { key: 'lifesupport', name: 'Life Support', desc: `1 per 10 crew (${Math.ceil(ship.crew / 10)})`, max: Math.ceil(ship.crew / 10) * 2, val: alloc.lifesupport || Math.ceil(ship.crew / 10) },
            { key: 'sensors', name: 'Sensors', desc: '1 per Sensor', max: 10, val: alloc.sensors || 1 },
            { key: 'weapons', name: 'Weapons', desc: '1 per Turret + System', max: Math.floor(ship.powerMax * 0.6), val: alloc.weapons || 0 },
            { key: 'screens', name: 'Screens', desc: 'Per type', max: 60, val: alloc.screens || 0 },
            { key: 'reactions', name: 'Reactions', desc: 'Reserve for reactions', max: Math.floor(ship.powerMax * 0.3), val: alloc.reactions || 0 },
        ];

        const totalUsed = systems.reduce((sum, s) => sum + s.val, 0);
        const remaining = ship.powerMax - totalUsed;
        const remainClass = remaining < 0 ? 'over' : remaining < 10 ? 'warning' : 'ok';

        panel.innerHTML = `
            <div class="power-grid">
                ${systems.map(s => `
                    <div class="power-system-name">${s.name}
                        <div style="font-size: 0.6rem; color: var(--text-muted); text-transform: none; font-family: var(--font-body); letter-spacing: 0; font-weight: 400;">${s.desc}</div>
                    </div>
                    <input type="range" class="power-slider" min="0" max="${s.max}" value="${s.val}"
                           data-system="${s.key}" data-ship="${shipId}"
                           oninput="Power.onSliderChange(this)">
                    <div class="power-ep-value" id="power-val-${s.key}">${s.val} EP</div>
                `).join('')}
            </div>
            <div class="power-total">
                <span style="font-family: var(--font-display); font-size: 0.72rem; color: var(--text-secondary);">
                    Total: ${totalUsed} / ${ship.powerMax} EP
                </span>
                <span class="power-remaining ${remainClass}">
                    ${remaining >= 0 ? remaining + ' EP Remaining' : Math.abs(remaining) + ' EP OVER BUDGET'}
                </span>
            </div>
        `;
    }

    function onSliderChange(slider) {
        const system = slider.dataset.system;
        const shipId = slider.dataset.ship;
        const val = parseInt(slider.value);

        const ship = Ships.getShip(shipId);
        if (!ship) return;

        if (!ship.powerAllocation) ship.powerAllocation = {};
        ship.powerAllocation[system] = val;

        // Update the value display
        const valEl = document.getElementById(`power-val-${system}`);
        if (valEl) valEl.textContent = `${val} EP`;

        // Recalculate total
        const allSliders = document.querySelectorAll('.power-slider');
        let total = 0;
        allSliders.forEach(s => { total += parseInt(s.value) || 0; });

        const remaining = ship.powerMax - total;
        const remainClass = remaining < 0 ? 'over' : remaining < 10 ? 'warning' : 'ok';

        const totalEl = document.querySelector('.power-total');
        if (totalEl) {
            totalEl.innerHTML = `
                <span style="font-family: var(--font-display); font-size: 0.72rem; color: var(--text-secondary);">
                    Total: ${total} / ${ship.powerMax} EP
                </span>
                <span class="power-remaining ${remainClass}">
                    ${remaining >= 0 ? remaining + ' EP Remaining' : Math.abs(remaining) + ' EP OVER BUDGET'}
                </span>
            `;
        }

        // Save
        Ships.getAll(); // just trigger side effect
        try {
            localStorage.setItem('ttt_ships', JSON.stringify(Ships.getAll()));
        } catch (e) { /* ignore */ }
    }

    function init() {
        const sel = document.getElementById('powerShipSelect');
        sel?.addEventListener('change', () => {
            render(sel.value);
        });

        Ships.onChange(() => {
            const sel = document.getElementById('powerShipSelect');
            if (sel?.value) render(sel.value);
        });
    }

    return { init, render, onSliderChange };
})();
