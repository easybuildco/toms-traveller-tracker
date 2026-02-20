/* ============================================
   CRITICAL HIT SYSTEM
   Tom's Traveller Tracker
   ============================================ */
const Crits = (() => {
    function rollCriticalHit() {
        const effect = parseInt(document.getElementById('critEffect')?.value) || 0;
        const severity = Math.max(1, effect - 5);
        const locRoll = Dice.roll2D();
        const location = GameData.CRIT_LOCATIONS.find(l => l.roll === locRoll.total);
        const locName = location ? location.location : 'Unknown';
        const effects = GameData.CRIT_EFFECTS[locName];
        const effectText = effects ? effects[Math.min(severity, 6) - 1] : 'Unknown effect';
        const isHullBreach = GameData.HULL_BREACH_LOCATIONS.includes(locName);
        const resultEl = document.getElementById('critResult');
        if (!resultEl) return;
        resultEl.classList.remove('hidden');
        resultEl.innerHTML = `
            <div class="crit-display">
                <div class="flex justify-between items-center mb-md">
                    <div>
                        <div class="crit-location">${locName}</div>
                        <div style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-muted);">
                            Location Roll: ${locRoll.rolls.join('+')} = ${locRoll.total}
                        </div>
                    </div>
                    <div class="severity-badge severity-${severity}">${severity}</div>
                </div>
                <div class="crit-severity">Severity ${severity} (Effect ${effect} - 5)</div>
                <div class="crit-effect">${effectText}</div>
                ${isHullBreach ? `<div style="margin-top:var(--space-sm);padding:var(--space-sm);background:rgba(255,23,68,0.1);border-radius:var(--radius-sm);border:1px solid rgba(255,23,68,0.3);"><span style="color:var(--red);font-family:var(--font-display);font-size:0.7rem;">⚠ HULL BREACH</span><div style="font-size:0.78rem;color:var(--text-secondary);margin-top:2px;">${GameData.HULL_BREACH_DAMAGE}</div></div>` : ''}
                <div class="flex gap-sm mt-md">
                    <button class="btn btn-secondary btn-sm" onclick="Crits.applyToShip('${locName}',${severity})">Apply to Ship</button>
                    <button class="btn btn-secondary btn-sm" onclick="Crits.rollCriticalHit()">🎲 Roll Again</button>
                </div>
            </div>`;
    }

    function applyToShip(location, severity) {
        const shipId = document.getElementById('critShipSelect')?.value;
        if (!shipId) { App.toast('Select a ship in the Critical Hit Tracker below first.', 'warning'); return; }
        const ship = Ships.getShip(shipId);
        if (!ship) return;
        const current = ship.criticalHits[location] || 0;
        let newSev = current > 0 ? Math.max(severity, current + 1) : severity;
        newSev = Math.min(6, newSev);
        Ships.setCritical(shipId, location, newSev);
        if (current >= 6) {
            const extra = Dice.rollSum(6, 6);
            App.toast(`${ship.name}: ${location} maxed at Severity 6 — ${extra.total} extra damage!`, 'danger');
        } else {
            App.toast(`${ship.name}: ${location} critical hit — Severity ${newSev}`, 'warning');
        }
        renderCritTracker(shipId);
    }

    function renderCritTracker(shipId) {
        const panel = document.getElementById('critTrackerPanel');
        if (!panel) return;
        if (!shipId) { panel.innerHTML = '<div class="empty-state"><div class="empty-icon">📊</div><p>Select a ship to track critical hits.</p></div>'; return; }
        const ship = Ships.getShip(shipId);
        if (!ship) return;
        const locations = GameData.CRIT_LOCATIONS.map(l => l.location);
        panel.innerHTML = '<div class="crit-tracker-grid">' + locations.map(loc => {
            const sev = ship.criticalHits[loc] || 0;
            const isActive = sev > 0;
            const effects = GameData.CRIT_EFFECTS[loc];
            const effText = isActive && effects ? effects[sev - 1] : '';
            return `<div class="crit-slot ${isActive ? 'active' : ''}" title="${effText}"><div><div class="crit-loc-name">${loc}</div>${isActive ? `<div style="font-size:0.7rem;color:var(--text-muted);margin-top:2px;max-width:140px;line-height:1.2;">${effText}</div>` : ''}</div><div class="flex gap-xs items-center">${isActive ? `<div class="severity-badge severity-${sev}">${sev}</div>` : '<div style="font-family:var(--font-mono);font-size:0.8rem;color:var(--text-muted);">—</div>'}<div class="flex flex-col gap-xs"><button class="btn btn-secondary btn-sm" style="padding:1px 5px;font-size:0.6rem;" onclick="Crits.adjustCrit('${shipId}','${loc}',1)">+</button><button class="btn btn-secondary btn-sm" style="padding:1px 5px;font-size:0.6rem;" onclick="Crits.adjustCrit('${shipId}','${loc}',-1)">−</button></div></div></div>`;
        }).join('') + '</div>';
    }

    function adjustCrit(shipId, location, delta) {
        const ship = Ships.getShip(shipId);
        if (!ship) return;
        const current = ship.criticalHits[location] || 0;
        Ships.setCritical(shipId, location, Math.max(0, Math.min(6, current + delta)));
        renderCritTracker(shipId);
    }

    function renderCritEffectsTable() {
        const container = document.getElementById('critEffectsTable');
        if (!container) return;
        const locs = Object.keys(GameData.CRIT_EFFECTS);
        container.innerHTML = '<div style="overflow-x:auto;"><table class="data-table"><thead><tr><th>Location</th><th>Sev 1</th><th>Sev 2</th><th>Sev 3</th><th>Sev 4</th><th>Sev 5</th><th>Sev 6</th></tr></thead><tbody>' +
            locs.map(loc => '<tr><td style="font-family:var(--font-display);font-size:0.7rem;color:var(--red);white-space:nowrap;">' + loc + '</td>' +
                GameData.CRIT_EFFECTS[loc].map(eff => '<td style="font-size:0.75rem;min-width:120px;">' + eff + '</td>').join('') + '</tr>'
            ).join('') + '</tbody></table></div>';
    }

    function init() {
        document.getElementById('btnRollCrit')?.addEventListener('click', rollCriticalHit);
        const critSel = document.getElementById('critShipSelect');
        critSel?.addEventListener('change', () => renderCritTracker(critSel.value));
        document.getElementById('btnToggleCritTable')?.addEventListener('click', () => {
            const el = document.getElementById('critEffectsTable');
            if (el) { el.classList.toggle('hidden'); if (!el.classList.contains('hidden') && !el.innerHTML.trim()) renderCritEffectsTable(); }
        });
        Ships.onChange(() => { const s = document.getElementById('critShipSelect'); if (s?.value) renderCritTracker(s.value); });
    }

    return { init, rollCriticalHit, applyToShip, renderCritTracker, adjustCrit };
})();
