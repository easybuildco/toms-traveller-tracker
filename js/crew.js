/* ============================================
   CREW ACTIONS TRACKER
   Tom's Traveller Tracker
   ============================================ */
const Crew = (() => {
    let actionsUsed = 0;
    const MAX_ACTIONS = 6;

    function renderBudget() {
        const el = document.getElementById('actionBudget');
        if (!el) return;
        let html = '';
        for (let i = 0; i < MAX_ACTIONS; i++) {
            html += `<div class="action-pip ${i < actionsUsed ? 'used' : ''}" onclick="Crew.togglePip(${i})" title="Action ${i + 1}"></div>`;
        }
        el.innerHTML = html;
    }

    function togglePip(index) {
        if (index < actionsUsed) {
            actionsUsed = index;
        } else {
            actionsUsed = index + 1;
        }
        renderBudget();
    }

    function renderActions() {
        const el = document.getElementById('actionList');
        if (!el) return;
        el.innerHTML = GameData.CREW_ACTIONS.map(a => `
            <div class="action-item">
                <div class="action-name">${a.action}</div>
                <div class="action-role">${a.role}</div>
                <div class="action-diff">${a.difficulty}</div>
                <div class="action-desc">${a.desc}</div>
            </div>
        `).join('');
    }

    function initQuickCheck() {
        document.getElementById('btnCrewCheck')?.addEventListener('click', () => {
            const target = parseInt(document.getElementById('crewCheckTarget')?.value) || 8;
            const dm = parseInt(document.getElementById('crewCheckDM')?.value) || 0;
            Dice.animatedRoll('crewDiceResult', 2, 6, (result) => {
                const total = result.total + dm;
                const effect = total - target;
                const success = effect >= 0;
                const outcomeEl = document.getElementById('crewCheckOutcome');
                if (outcomeEl) {
                    const eStr = effect >= 0 ? `+${effect}` : `${effect}`;
                    outcomeEl.innerHTML = success
                        ? `<span class="text-green">SUCCESS</span> Effect: <span class="text-amber">${eStr}</span> (${result.total}${dm !== 0 ? (dm > 0 ? '+' + dm : dm) : ''} = ${total} vs ${target}+)`
                        : `<span class="text-red">FAILURE</span> Effect: <span class="text-muted">${eStr}</span> (${result.total}${dm !== 0 ? (dm > 0 ? '+' + dm : dm) : ''} = ${total} vs ${target}+)`;
                }
            });
        });
    }

    function resetActions() { actionsUsed = 0; renderBudget(); }

    function init() {
        renderBudget();
        renderActions();
        initQuickCheck();
    }

    return { init, togglePip, resetActions };
})();
