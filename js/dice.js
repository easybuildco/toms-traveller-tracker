/* ============================================
   DICE ROLLER UTILITY
   Tom's Traveller Tracker
   ============================================ */

const Dice = (() => {
    function roll(sides = 6) {
        return Math.floor(Math.random() * sides) + 1;
    }

    function rollMultiple(count, sides = 6) {
        const rolls = [];
        for (let i = 0; i < count; i++) {
            rolls.push(roll(sides));
        }
        return rolls;
    }

    function rollSum(count, sides = 6) {
        const rolls = rollMultiple(count, sides);
        return { rolls, total: rolls.reduce((a, b) => a + b, 0) };
    }

    // Standard Traveller 2D6 check
    function check2D(dm = 0) {
        const result = rollSum(2, 6);
        return {
            rolls: result.rolls,
            natural: result.total,
            dm,
            total: result.total + dm,
        };
    }

    // Effect = total - target number
    function skillCheck(targetNumber, dm = 0) {
        const result = check2D(dm);
        result.target = targetNumber;
        result.effect = result.total - targetNumber;
        result.success = result.effect >= 0;
        return result;
    }

    // 1D6
    function roll1D() { return rollSum(1, 6); }
    // 2D6
    function roll2D() { return rollSum(2, 6); }
    // 3D6
    function roll3D() { return rollSum(3, 6); }
    // 1D3
    function roll1D3() { return rollSum(1, 3); }

    // Animated dice roll for UI
    function animatedRoll(container, count, sides, callback) {
        const el = typeof container === 'string' ? document.getElementById(container) : container;
        if (!el) return;

        let frames = 0;
        const maxFrames = 12;
        const interval = setInterval(() => {
            const fakeRolls = rollMultiple(count, sides);
            el.textContent = fakeRolls.join(', ');
            el.classList.add('dice-rolling');
            frames++;
            if (frames >= maxFrames) {
                clearInterval(interval);
                el.classList.remove('dice-rolling');
                const result = rollSum(count, sides);
                el.textContent = result.rolls.join(', ') + ' = ' + result.total;
                el.classList.add('dice-landed');
                setTimeout(() => el.classList.remove('dice-landed'), 600);
                if (callback) callback(result);
            }
        }, 60);
    }

    return {
        roll, rollMultiple, rollSum,
        check2D, skillCheck,
        roll1D, roll2D, roll3D, roll1D3,
        animatedRoll,
    };
})();
