/* ============================================
   TURN SEQUENCE TRACKER
   Tom's Traveller Tracker
   ============================================ */

const Turn = (() => {
    let currentTurn = 1;
    let currentPhaseIndex = 0;
    let currentStepIndex = 0;

    function getCurrentPhase() {
        return GameData.TURN_PHASES[currentPhaseIndex];
    }

    function getCurrentStep() {
        const phase = getCurrentPhase();
        return phase ? phase.steps[currentStepIndex] : null;
    }

    function nextStep() {
        const phase = getCurrentPhase();
        if (!phase) return;

        if (currentStepIndex < phase.steps.length - 1) {
            currentStepIndex++;
        } else if (currentPhaseIndex < GameData.TURN_PHASES.length - 1) {
            currentPhaseIndex++;
            currentStepIndex = 0;
        } else {
            // End of turn
            newTurn();
            return;
        }
        save();
        render();
        updateBadge();
    }

    function newTurn() {
        currentTurn++;
        currentPhaseIndex = 0;
        currentStepIndex = 0;
        save();
        render();
        updateBadge();
        updateTurnCounter();
        App.toast(`Turn ${currentTurn} begins!`, 'info');
    }

    function reset() {
        currentTurn = 1;
        currentPhaseIndex = 0;
        currentStepIndex = 0;
        save();
        render();
        updateBadge();
        updateTurnCounter();
    }

    function updateTurnCounter() {
        const el = document.getElementById('turnCounter');
        if (el) el.textContent = `Turn ${currentTurn}`;
    }

    function updateBadge() {
        const el = document.getElementById('currentStepBadge');
        const phase = getCurrentPhase();
        const step = getCurrentStep();
        if (el && phase && step) {
            el.textContent = `${phase.name} > ${step.name}`;
        }
    }

    function render() {
        const container = document.getElementById('turnStepper');
        if (!container) return;

        container.innerHTML = GameData.TURN_PHASES.map((phase, pi) => {
            const isCurrent = pi === currentPhaseIndex;
            const isCompleted = pi < currentPhaseIndex;
            const isExpanded = isCurrent;

            let status = 'pending';
            if (isCompleted) status = 'completed';
            if (isCurrent) status = 'in progress';

            const statusLabel = isCompleted ? '✓ Complete' : isCurrent ? '● Active' : '○ Pending';

            return `
                <div class="phase-block ${isCurrent ? 'current expanded' : ''} ${isCompleted ? 'completed' : ''}"
                     style="border-color: ${phase.color};"
                     data-phase="${pi}">
                    <div class="phase-header" onclick="Turn.togglePhase(${pi})">
                        <div class="phase-icon" style="background: ${phase.color}22; color: ${phase.color};">
                            ${phase.icon}
                        </div>
                        <div class="phase-name" style="color: ${isCurrent ? phase.color : 'inherit'};">
                            ${phase.name}
                        </div>
                        <div class="phase-status">${statusLabel}</div>
                    </div>
                    <div class="phase-steps">
                        ${phase.steps.map((step, si) => {
                const stepCurrent = isCurrent && si === currentStepIndex;
                const stepDone = isCompleted || (isCurrent && si < currentStepIndex);
                return `
                                <div class="step-item ${stepCurrent ? 'current' : ''} ${stepDone ? 'completed' : ''}">
                                    <div class="step-dot"></div>
                                    <div class="step-info">
                                        <div class="step-name">${step.name}</div>
                                        <div class="step-desc">${step.desc}</div>
                                    </div>
                                </div>
                            `;
            }).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    function togglePhase(phaseIndex) {
        const blocks = document.querySelectorAll('.phase-block');
        blocks.forEach((block, i) => {
            if (i === phaseIndex) {
                block.classList.toggle('expanded');
            }
        });
    }

    // ── G-Force Calculator ──
    function initGForce() {
        const thrustEl = document.getElementById('gfThrust');
        const velEl = document.getElementById('gfVelocity');
        const totalEl = document.getElementById('gfTotal');
        const btn = document.getElementById('btnCalcGForce');

        function updateTotal() {
            const t = parseInt(thrustEl.value) || 0;
            const v = parseInt(velEl.value) || 0;
            totalEl.value = t + v;
        }

        thrustEl?.addEventListener('input', updateTotal);
        velEl?.addEventListener('input', updateTotal);

        btn?.addEventListener('click', () => {
            const total = parseInt(totalEl.value) || 0;
            const resultEl = document.getElementById('gforceResult');
            if (!resultEl) return;

            if (total <= 0) {
                resultEl.classList.add('hidden');
                return;
            }

            // Find matching G-force row
            let row = null;
            for (const r of GameData.GFORCE_TABLE) {
                const [min, max] = parseHexRange(r.hexes);
                if (total >= min && total <= max) {
                    row = r;
                    break;
                }
            }

            if (!row) {
                row = GameData.GFORCE_TABLE[GameData.GFORCE_TABLE.length - 1]; // highest
            }

            resultEl.classList.remove('hidden');
            resultEl.innerHTML = `
                <div class="crit-display" style="border-color: var(--phase-maneuver); background: rgba(102, 187, 106, 0.06);">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
                        <div>
                            <div style="font-family: var(--font-display); font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">G-Level</div>
                            <div style="font-family: var(--font-mono); font-size: 1.2rem; color: var(--amber);">${row.gLevel}</div>
                        </div>
                        <div>
                            <div style="font-family: var(--font-display); font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Endurance Save</div>
                            <div style="font-family: var(--font-mono); font-size: 1rem; color: var(--cyan);">${row.save}</div>
                        </div>
                        <div>
                            <div style="font-family: var(--font-display); font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Base Effect</div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">${row.effect}</div>
                        </div>
                        <div>
                            <div style="font-family: var(--font-display); font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">G-LOC (Fail by 2+)</div>
                            <div style="font-size: 0.85rem; color: var(--red);">${row.gloc}</div>
                        </div>
                        <div style="grid-column: 1 / -1;">
                            <div style="font-family: var(--font-display); font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Spin Check Required</div>
                            <div style="font-size: 0.85rem; color: ${row.spinCheck === 'No' ? 'var(--green)' : 'var(--red)'};">${row.spinCheck}</div>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    function parseHexRange(str) {
        if (str.includes('+')) {
            return [parseInt(str), 999];
        }
        const parts = str.split('-');
        if (parts.length === 1) return [parseInt(parts[0]), parseInt(parts[0])];
        return [parseInt(parts[0]), parseInt(parts[1])];
    }

    // ── Persistence ──
    function save() {
        try {
            localStorage.setItem('ttt_turn', JSON.stringify({
                turn: currentTurn,
                phase: currentPhaseIndex,
                step: currentStepIndex,
            }));
        } catch (e) { /* ignore */ }
    }

    function load() {
        try {
            const data = localStorage.getItem('ttt_turn');
            if (data) {
                const parsed = JSON.parse(data);
                currentTurn = parsed.turn || 1;
                currentPhaseIndex = parsed.phase || 0;
                currentStepIndex = parsed.step || 0;
            }
        } catch (e) { /* ignore */ }
    }

    function resetState() {
        currentTurn = 1;
        currentPhaseIndex = 0;
        currentStepIndex = 0;
        save();
    }

    function init() {
        load();
        render();
        updateBadge();
        updateTurnCounter();
        initGForce();

        document.getElementById('btnNextStep')?.addEventListener('click', nextStep);
        document.getElementById('btnNewTurn')?.addEventListener('click', () => {
            if (confirm('Start a new turn?')) newTurn();
        });
    }

    return {
        init, nextStep, newTurn, reset: resetState,
        getCurrentPhase, getCurrentStep,
        render, togglePhase, updateTurnCounter,
    };
})();
