/* ============================================
   SHIP MANAGER
   Tom's Traveller Tracker
   ============================================ */

const Ships = (() => {
    let ships = [];
    let onChangeCallbacks = [];

    function generateId() {
        return 'ship_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    }

    function createShip(data) {
        return {
            id: generateId(),
            name: data.name || 'Unnamed Ship',
            shipClass: data.shipClass || '',
            side: data.side || 'friendly',
            hullMax: parseInt(data.hull) || 80,
            hullCurrent: parseInt(data.hull) || 80,
            armor: parseInt(data.armor) || 0,
            armorCurrent: parseInt(data.armor) || 0,
            thrustMax: parseInt(data.thrust) || 2,
            thrustCurrent: parseInt(data.thrust) || 2,
            powerMax: parseInt(data.power) || 60,
            crew: parseInt(data.crew) || 10,
            sensorGrade: data.sensorGrade || 'Military',
            tonnage: parseInt(data.tonnage) || 200,
            fuelMax: parseInt(data.fuel) || 40,
            fuelCurrent: parseInt(data.fuel) || 40,
            velocity: 0,
            criticalHits: {},  // { 'Sensors': 2, 'Hull': 1, ... }
            powerAllocation: {},
            destroyed: false,
        };
    }

    function addShip(data) {
        const ship = createShip(data);
        ships.push(ship);
        save();
        notifyChange();
        return ship;
    }

    function updateShip(id, data) {
        const ship = getShip(id);
        if (!ship) return null;
        Object.assign(ship, {
            name: data.name || ship.name,
            shipClass: data.shipClass || ship.shipClass,
            side: data.side || ship.side,
            hullMax: parseInt(data.hull) || ship.hullMax,
            armor: parseInt(data.armor) || ship.armor,
            armorCurrent: parseInt(data.armor) || ship.armorCurrent,
            thrustMax: parseInt(data.thrust) || ship.thrustMax,
            thrustCurrent: parseInt(data.thrust) || ship.thrustCurrent,
            powerMax: parseInt(data.power) || ship.powerMax,
            crew: parseInt(data.crew) || ship.crew,
            sensorGrade: data.sensorGrade || ship.sensorGrade,
            tonnage: parseInt(data.tonnage) || ship.tonnage,
            fuelMax: parseInt(data.fuel) || ship.fuelMax,
        });
        // If hull max changed and current is more, cap it
        if (ship.hullCurrent > ship.hullMax) ship.hullCurrent = ship.hullMax;
        if (ship.fuelCurrent > ship.fuelMax) ship.fuelCurrent = ship.fuelMax;
        save();
        notifyChange();
        return ship;
    }

    function removeShip(id) {
        ships = ships.filter(s => s.id !== id);
        save();
        notifyChange();
    }

    function getShip(id) {
        return ships.find(s => s.id === id) || null;
    }

    function getAll() {
        return ships;
    }

    function applyDamage(id, rawDamage, ap = 0) {
        const ship = getShip(id);
        if (!ship) return null;

        const effectiveArmor = Math.max(0, ship.armorCurrent - ap);
        const finalDamage = Math.max(0, rawDamage - effectiveArmor);
        ship.hullCurrent = Math.max(0, ship.hullCurrent - finalDamage);

        if (ship.hullCurrent <= 0) {
            ship.destroyed = true;
        }

        save();
        notifyChange();
        return { rawDamage, effectiveArmor, finalDamage, remainingHull: ship.hullCurrent, destroyed: ship.destroyed };
    }

    function healHull(id, amount) {
        const ship = getShip(id);
        if (!ship) return;
        ship.hullCurrent = Math.min(ship.hullMax, ship.hullCurrent + amount);
        save();
        notifyChange();
    }

    function setCritical(id, location, severity) {
        const ship = getShip(id);
        if (!ship) return;
        if (severity <= 0) {
            delete ship.criticalHits[location];
        } else {
            ship.criticalHits[location] = Math.min(6, severity);
        }
        save();
        notifyChange();
    }

    function getHullPercent(ship) {
        if (ship.hullMax <= 0) return 0;
        return (ship.hullCurrent / ship.hullMax) * 100;
    }

    function getHealthClass(ship) {
        const pct = getHullPercent(ship);
        if (pct > 50) return 'healthy';
        if (pct > 20) return 'damaged';
        return 'critical';
    }

    function getSizeCategory(ship) {
        if (ship.tonnage > 50000) return 'Very Large (+4)';
        if (ship.tonnage > 5000) return 'Large (+2)';
        return 'Normal';
    }

    // ── Rendering ──
    function renderShipCards() {
        const grid = document.getElementById('shipGrid');
        const empty = document.getElementById('shipsEmpty');
        if (!grid) return;

        if (ships.length === 0) {
            grid.innerHTML = '';
            grid.appendChild(empty);
            empty.classList.remove('hidden');
            return;
        }

        empty.classList.add('hidden');
        grid.innerHTML = ships.map(ship => {
            const pct = getHullPercent(ship);
            const hClass = getHealthClass(ship);
            const critCount = Object.keys(ship.criticalHits).length;

            return `
                <div class="ship-card ${ship.side === 'enemy' ? 'enemy' : ''} ${ship.destroyed ? 'destroyed' : ''}" data-ship-id="${ship.id}">
                    <div class="flex justify-between items-center">
                        <div>
                            <div class="ship-name">${escapeHtml(ship.name)}</div>
                            <div class="ship-class">${escapeHtml(ship.shipClass)}${ship.destroyed ? ' — <span class="text-red">DESTROYED</span>' : ''}</div>
                        </div>
                        <div class="flex gap-xs">
                            <button class="btn btn-secondary btn-icon btn-sm" onclick="Ships.openEditModal('${ship.id}')" title="Edit">✏️</button>
                            <button class="btn btn-danger btn-icon btn-sm" onclick="Ships.confirmRemove('${ship.id}')" title="Remove">🗑️</button>
                        </div>
                    </div>
                    <div class="health-bar-container">
                        <div class="health-bar-label">
                            <span>Hull</span>
                            <span>${ship.hullCurrent} / ${ship.hullMax}</span>
                        </div>
                        <div class="health-bar">
                            <div class="health-bar-fill ${hClass}" style="width: ${pct}%"></div>
                        </div>
                    </div>
                    <div class="ship-stats">
                        <div class="stat-box">
                            <div class="stat-label">Armor</div>
                            <div class="stat-value">${ship.armorCurrent}</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-label">Thrust</div>
                            <div class="stat-value">${ship.thrustCurrent}</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-label">Power</div>
                            <div class="stat-value">${ship.powerMax}</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-label">Sensors</div>
                            <div class="stat-value" style="font-size: 0.7rem;">${ship.sensorGrade}</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-label">Fuel</div>
                            <div class="stat-value">${ship.fuelCurrent}</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-label">Crits</div>
                            <div class="stat-value ${critCount > 0 ? 'text-red' : ''}">${critCount}</div>
                        </div>
                    </div>
                    <div class="ship-actions">
                        <button class="btn btn-secondary btn-sm" onclick="Ships.quickDamage('${ship.id}')">Apply Damage</button>
                        <button class="btn btn-secondary btn-sm" onclick="Ships.quickHeal('${ship.id}')">Heal</button>
                        <button class="btn btn-secondary btn-sm" onclick="Ships.adjustVelocity('${ship.id}')">Velocity: ${ship.velocity}</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderShipSelects() {
        const selects = document.querySelectorAll('#powerShipSelect, #critShipSelect, #combatAttackerSelect, #combatTargetSelect');
        selects.forEach(sel => {
            const current = sel.value;
            sel.innerHTML = '<option value="">-- Select Ship --</option>' +
                ships.map(s => `<option value="${s.id}">${escapeHtml(s.name)}${s.destroyed ? ' (destroyed)' : ''}</option>`).join('');
            if (current && ships.find(s => s.id === current)) {
                sel.value = current;
            }
        });
    }

    // ── Modal Handling ──
    function openAddModal() {
        document.getElementById('shipModalTitle').textContent = 'Add Ship';
        document.getElementById('shipEditId').value = '';
        document.getElementById('shipName').value = '';
        document.getElementById('shipClass').value = '';
        document.getElementById('shipSide').value = 'friendly';
        document.getElementById('shipHull').value = '80';
        document.getElementById('shipArmor').value = '4';
        document.getElementById('shipThrust').value = '2';
        document.getElementById('shipPower').value = '60';
        document.getElementById('shipCrew').value = '10';
        document.getElementById('shipSensorGrade').value = 'Military';
        document.getElementById('shipTonnage').value = '200';
        document.getElementById('shipFuel').value = '40';
        document.getElementById('shipModal').classList.add('visible');
    }

    function openEditModal(id) {
        const ship = getShip(id);
        if (!ship) return;
        document.getElementById('shipModalTitle').textContent = 'Edit Ship';
        document.getElementById('shipEditId').value = id;
        document.getElementById('shipName').value = ship.name;
        document.getElementById('shipClass').value = ship.shipClass;
        document.getElementById('shipSide').value = ship.side;
        document.getElementById('shipHull').value = ship.hullMax;
        document.getElementById('shipArmor').value = ship.armor;
        document.getElementById('shipThrust').value = ship.thrustMax;
        document.getElementById('shipPower').value = ship.powerMax;
        document.getElementById('shipCrew').value = ship.crew;
        document.getElementById('shipSensorGrade').value = ship.sensorGrade;
        document.getElementById('shipTonnage').value = ship.tonnage;
        document.getElementById('shipFuel').value = ship.fuelMax;
        document.getElementById('shipModal').classList.add('visible');
    }

    function closeModal() {
        document.getElementById('shipModal').classList.remove('visible');
    }

    function saveFromModal() {
        const editId = document.getElementById('shipEditId').value;
        const data = {
            name: document.getElementById('shipName').value.trim(),
            shipClass: document.getElementById('shipClass').value.trim(),
            side: document.getElementById('shipSide').value,
            hull: document.getElementById('shipHull').value,
            armor: document.getElementById('shipArmor').value,
            thrust: document.getElementById('shipThrust').value,
            power: document.getElementById('shipPower').value,
            crew: document.getElementById('shipCrew').value,
            sensorGrade: document.getElementById('shipSensorGrade').value,
            tonnage: document.getElementById('shipTonnage').value,
            fuel: document.getElementById('shipFuel').value,
        };

        if (!data.name) {
            App.toast('Ship name is required', 'warning');
            return;
        }

        if (editId) {
            updateShip(editId, data);
            App.toast(`${data.name} updated`, 'success');
        } else {
            addShip(data);
            App.toast(`${data.name} added to encounter`, 'success');
        }
        closeModal();
    }

    function confirmRemove(id) {
        const ship = getShip(id);
        if (!ship) return;
        if (confirm(`Remove ${ship.name} from the encounter?`)) {
            removeShip(id);
            App.toast(`${ship.name} removed`, 'info');
        }
    }

    function quickDamage(id) {
        const ship = getShip(id);
        if (!ship) return;
        const input = prompt(`Apply how much raw damage to ${ship.name}? (Armor: ${ship.armorCurrent})`, '10');
        if (input === null) return;
        const dmg = parseInt(input) || 0;
        if (dmg <= 0) return;
        const apInput = prompt('AP value of weapon? (0 if none)', '0');
        const ap = parseInt(apInput) || 0;
        const result = applyDamage(id, dmg, ap);
        if (result) {
            App.toast(`${ship.name}: ${result.finalDamage} damage applied (${result.rawDamage} raw - ${result.effectiveArmor} armor). Hull: ${result.remainingHull}`, result.destroyed ? 'danger' : 'warning');
        }
    }

    function quickHeal(id) {
        const ship = getShip(id);
        if (!ship) return;
        const input = prompt(`Heal how many hull points on ${ship.name}?`, '10');
        if (input === null) return;
        const amt = parseInt(input) || 0;
        if (amt <= 0) return;
        healHull(id, amt);
        App.toast(`${ship.name}: healed ${amt} hull points`, 'success');
    }

    function adjustVelocity(id) {
        const ship = getShip(id);
        if (!ship) return;
        const input = prompt(`Set velocity for ${ship.name}:`, ship.velocity);
        if (input === null) return;
        ship.velocity = parseInt(input) || 0;
        save();
        notifyChange();
    }

    // ── Persistence ──
    function save() {
        try {
            localStorage.setItem('ttt_ships', JSON.stringify(ships));
        } catch (e) { /* ignore */ }
    }

    function load() {
        try {
            const data = localStorage.getItem('ttt_ships');
            if (data) {
                ships = JSON.parse(data);
            }
        } catch (e) { ships = []; }
    }

    // ── Change notifications ──
    function onChange(cb) {
        onChangeCallbacks.push(cb);
    }

    function notifyChange() {
        renderShipCards();
        renderShipSelects();
        onChangeCallbacks.forEach(cb => cb(ships));
    }

    // ── Init ──
    function init() {
        load();

        document.getElementById('btnAddShip')?.addEventListener('click', openAddModal);
        document.getElementById('shipModalClose')?.addEventListener('click', closeModal);
        document.getElementById('shipModalCancel')?.addEventListener('click', closeModal);
        document.getElementById('shipModalSave')?.addEventListener('click', saveFromModal);
        document.getElementById('shipModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'shipModal') closeModal();
        });

        renderShipCards();
        renderShipSelects();
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function resetAll() {
        ships = [];
        save();
        notifyChange();
    }

    return {
        init, getAll, getShip, addShip, updateShip, removeShip,
        applyDamage, healHull, setCritical,
        getHullPercent, getHealthClass, getSizeCategory,
        renderShipCards, renderShipSelects,
        openAddModal, openEditModal, closeModal, saveFromModal,
        confirmRemove, quickDamage, quickHeal, adjustVelocity,
        onChange, resetAll,
    };
})();
