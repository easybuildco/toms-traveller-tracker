/* ============================================
   COMBAT — Attack Rolls & Damage
   Tom's Traveller Tracker
   ============================================ */

const Combat = (() => {

    function getModifierTotal() {
        const vals = [
            parseInt(document.getElementById('atkGunnerSkill')?.value) || 0,
            parseInt(document.getElementById('atkDexMod')?.value) || 0,
            parseInt(document.getElementById('atkFireControl')?.value) || 0,
            parseInt(document.getElementById('atkTargetLock')?.value) || 0,
            parseInt(document.getElementById('atkRange')?.value) || 0,
            parseInt(document.getElementById('atkTargetSize')?.value) || 0,
            parseInt(document.getElementById('atkSpeedDiff')?.value) || 0,
            -(parseInt(document.getElementById('atkEvasive')?.value) || 0),
            parseInt(document.getElementById('atkArc')?.value) || 0,
            -(parseInt(document.getElementById('atkEvadeProg')?.value) || 0),
            parseInt(document.getElementById('atkOtherDM')?.value) || 0,
            parseInt(document.getElementById('atkCalledShot')?.value) || 0,
        ];
        return vals.reduce((a, b) => a + b, 0);
    }

    function renderModifierSummary() {
        const el = document.getElementById('modifierSummary');
        if (!el) return;

        const items = [
            { name: 'Gunner Skill', val: parseInt(document.getElementById('atkGunnerSkill')?.value) || 0 },
            { name: 'DEX Modifier', val: parseInt(document.getElementById('atkDexMod')?.value) || 0 },
            { name: 'Fire Control', val: parseInt(document.getElementById('atkFireControl')?.value) || 0 },
            { name: 'Target Lock', val: parseInt(document.getElementById('atkTargetLock')?.value) || 0 },
            { name: 'Range', val: parseInt(document.getElementById('atkRange')?.value) || 0 },
            { name: 'Target Size', val: parseInt(document.getElementById('atkTargetSize')?.value) || 0 },
            { name: 'Speed Difference', val: parseInt(document.getElementById('atkSpeedDiff')?.value) || 0 },
            { name: 'Target Evasive', val: -(parseInt(document.getElementById('atkEvasive')?.value) || 0) },
            { name: 'Firing Arc', val: parseInt(document.getElementById('atkArc')?.value) || 0 },
            { name: 'Evade Program', val: -(parseInt(document.getElementById('atkEvadeProg')?.value) || 0) },
            { name: 'Other DM', val: parseInt(document.getElementById('atkOtherDM')?.value) || 0 },
            { name: 'Called Shot', val: parseInt(document.getElementById('atkCalledShot')?.value) || 0 },
        ];

        const total = items.reduce((sum, i) => sum + i.val, 0);

        el.innerHTML = items
            .filter(i => i.val !== 0)
            .map(i => `
                <div class="mod-name">${i.name}</div>
                <div class="mod-value ${i.val > 0 ? 'text-green' : 'text-red'}">${i.val > 0 ? '+' : ''}${i.val}</div>
            `).join('') +
            `<div class="modifier-total">
                <div class="total-label">Total DM</div>
                <div class="total-value">${total >= 0 ? '+' : ''}${total}</div>
            </div>`;
    }

    function rollAttack() {
        const dm = getModifierTotal();
        const target = 8; // Standard attack target

        Dice.animatedRoll('attackDiceResult', 2, 6, (result) => {
            const total = result.total + dm;
            const effect = total - target;
            const hit = effect >= 0;

            const outcomeEl = document.getElementById('attackOutcome');
            if (outcomeEl) {
                const effectStr = effect >= 0 ? `+${effect}` : `${effect}`;
                outcomeEl.innerHTML = hit
                    ? `<span class="text-green">HIT!</span> Effect: <span class="text-amber">${effectStr}</span>${effect >= 6 ? ' <span class="badge badge-red">CRITICAL!</span>' : ''}`
                    : `<span class="text-red">MISS</span> Effect: <span class="text-muted">${effectStr}</span>`;

                // Auto-populate damage effect if hit
                if (hit) {
                    const dmgEffect = document.getElementById('dmgEffect');
                    if (dmgEffect) dmgEffect.value = effect;
                }
            }
        });
    }

    function rollDamage() {
        const dice = parseInt(document.getElementById('dmgDice')?.value) || 2;
        const multiplier = parseInt(document.getElementById('dmgMultiplier')?.value) || 1;
        const ap = parseInt(document.getElementById('dmgAP')?.value) || 0;
        const armor = parseInt(document.getElementById('dmgArmor')?.value) || 0;
        const effect = parseInt(document.getElementById('dmgEffect')?.value) || 0;
        const hullStart = parseInt(document.getElementById('dmgHullStart')?.value) || 100;

        const rollResult = Dice.rollSum(dice, 6);
        const rawDamage = rollResult.total * multiplier;
        const effectiveArmor = Math.max(0, armor - ap);
        const finalDamage = Math.max(0, rawDamage - effectiveArmor);

        // Check for critical hit conditions
        const critByEffect = effect >= 6;
        const critByDamage = finalDamage >= Math.floor(hullStart * 0.1);
        const isCrit = (critByEffect || critByDamage) && finalDamage > 0;

        const resultEl = document.getElementById('damageResult');
        if (!resultEl) return;
        resultEl.classList.remove('hidden');

        resultEl.innerHTML = `
            <div class="crit-display" style="border-color: ${isCrit ? 'var(--red)' : 'var(--amber)'}; background: ${isCrit ? 'rgba(255,23,68,0.06)' : 'rgba(255,171,0,0.06)'};">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md);">
                    <div>
                        <div style="font-family: var(--font-display); font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Dice Rolled</div>
                        <div style="font-family: var(--font-mono); font-size: 0.9rem; color: var(--text-secondary);">${rollResult.rolls.join(' + ')} = ${rollResult.total}</div>
                    </div>
                    <div>
                        <div style="font-family: var(--font-display); font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Raw Damage (×${multiplier})</div>
                        <div style="font-family: var(--font-mono); font-size: 1.2rem; color: var(--amber);">${rawDamage}</div>
                    </div>
                    <div>
                        <div style="font-family: var(--font-display); font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Armor (${armor}${ap > 0 ? ' - AP ' + ap : ''})</div>
                        <div style="font-family: var(--font-mono); font-size: 1rem; color: var(--text-secondary);">-${effectiveArmor}</div>
                    </div>
                </div>
                <div style="margin-top: var(--space-md); padding-top: var(--space-md); border-top: var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-family: var(--font-display); font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Final Damage</div>
                        <div style="font-family: var(--font-mono); font-size: 1.5rem; font-weight: 700; color: ${finalDamage > 0 ? 'var(--red)' : 'var(--green)'};">${finalDamage}</div>
                    </div>
                    ${isCrit ? `
                        <div class="badge badge-red" style="font-size: 0.8rem; padding: 6px 14px;">
                            ⚠ CRITICAL HIT! ${critByEffect ? '(Effect 6+)' : ''} ${critByDamage ? '(≥10% Hull)' : ''}
                        </div>
                    ` : ''}
                </div>
                ${isCrit ? `
                    <div style="margin-top: var(--space-sm); font-size: 0.8rem; color: var(--text-muted);">
                        Severity: Effect (${effect}) − 5 = <strong style="color: var(--red);">${Math.max(1, effect - 5)}</strong>.
                        Go to <strong>Critical Hits</strong> tab to roll location.
                    </div>
                ` : ''}
            </div>
        `;
    }

    function renderReactions() {
        const el = document.getElementById('reactionsRef');
        if (!el) return;

        el.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-md);">
                <div class="stat-box" style="text-align: left; padding: var(--space-md);">
                    <div class="stat-label" style="margin-bottom: 4px;">🛡️ Angle Screens</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">Gunner screen check (1/round). Reduces damage after armor.</div>
                </div>
                <div class="stat-box" style="text-align: left; padding: var(--space-md);">
                    <div class="stat-label" style="margin-bottom: 4px;">🛡️ Meson Screen</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">TL13 / 30 EP. Reduces meson damage by 2D×10, removes radiation.</div>
                </div>
                <div class="stat-box" style="text-align: left; padding: var(--space-md);">
                    <div class="stat-label" style="margin-bottom: 4px;">☢️ Nuclear Dampener</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">TL12 / 20 EP. Reduces fusion/nuclear damage by 2D, removes radiation.</div>
                </div>
                <div class="stat-box" style="text-align: left; padding: var(--space-md);">
                    <div class="stat-label" style="margin-bottom: 4px;">🏖️ Disperse Sand</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">Gunner turret check. Uses 1 canister. 1D + EFFECT adds to armor vs beams.</div>
                </div>
                <div class="stat-box" style="text-align: left; padding: var(--space-md);">
                    <div class="stat-label" style="margin-bottom: 4px;">🎯 Point Defense</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">Effect removes that many missiles from salvo. Each system engages 1 barrage.</div>
                </div>
                <div class="stat-box" style="text-align: left; padding: var(--space-md);">
                    <div class="stat-label" style="margin-bottom: 4px;">📡 ECM vs Missiles</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">Difficult (10+). Effect removes that many missiles. Protects vs ALL barrages this turn.</div>
                </div>
                <div class="stat-box" style="text-align: left; padding: var(--space-md);">
                    <div class="stat-label" style="margin-bottom: 4px;">🏃 Evade</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">Pilot skill level as negative DM vs ALL attacks. Costs 2 EP. Per unspent thrust EP.</div>
                </div>
            </div>
        `;
    }

    function init() {
        // Attack roll button
        document.getElementById('btnAttackRoll')?.addEventListener('click', rollAttack);

        // Damage roll button
        document.getElementById('btnRollDamage')?.addEventListener('click', rollDamage);

        // Update modifier summary on input change
        const inputIds = [
            'atkGunnerSkill', 'atkDexMod', 'atkFireControl', 'atkTargetLock',
            'atkRange', 'atkTargetSize', 'atkSpeedDiff', 'atkEvasive',
            'atkArc', 'atkEvadeProg', 'atkOtherDM', 'atkCalledShot',
        ];
        inputIds.forEach(id => {
            document.getElementById(id)?.addEventListener('input', renderModifierSummary);
            document.getElementById(id)?.addEventListener('change', renderModifierSummary);
        });

        renderModifierSummary();
        renderReactions();
    }

    return { init, rollAttack, rollDamage, renderModifierSummary };
})();
