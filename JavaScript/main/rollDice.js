export function initRollDice()
{
    const rollButton = document.getElementById('1d100_button');
    const rollResult = document.getElementById('1d100_result');
    const diceInput = document.getElementById('dice_input');

    if (rollButton)
    {
        rollButton.addEventListener
        (
            'click', () =>
            {
                let expr = diceInput.value.trim();

                if (!expr)
                {
                    expr = "0"; // 空欄の場合0
                }

                expr = expr.replace
                (
                    /(\d+)d(\d+)/gi, (match, count, sides) =>
                    {
                        let sum = 0;
                        const n = parseInt(count);
                        const s = parseInt(sides);
                        for (let i = 0; i < n; i++)
                        {
                            sum += Math.floor(Math.random() * s) + 1;
                        }
                        return sum;
                    }
                );

                try
                {
                    const result = math.evaluate(expr);
                    rollResult.textContent = `${result} (式：${diceInput.value})`;
                }
                catch (error)
                {
                    rollResult.textContent = "エラー";
                }
            }
        );
    }
}