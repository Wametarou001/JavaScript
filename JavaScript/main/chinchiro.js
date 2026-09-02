const chinchiroButton = document.getElementById("chinchiro_button");
const chinchiroResult = document.getElementById("chinchiro_result");
const chinchiroPointChange = document.getElementById("chinchiro_point_change");
const chinchiroBetInput = document.getElementById("chinchiro_bet");
const pointDisplay = document.getElementById("user_points");

function updatePointDisplay()
{
    if(!pointDisplay) return;
    const currentPoints = Number(localStorage.getItem("user_points")) || 0;
    pointDisplay.textContent = currentPoints;
}

export function initChinChiro()
{
    if (chinchiroButton)
    {
        chinchiroButton.addEventListener(
            "click", () =>
            {
                const betInputVal = chinchiroBetInput.value.trim();

                /**プレイヤーが賭けたポイント数 */
                const betAmount = betInputVal === "" ? 0 : Math.floor(Number(betInputVal));
                /**ゲーム開始時点の所持ポイント */
                const currentPoints = Number(localStorage.getItem("user_points")) || 0;

                if (isNaN(betAmount) || betAmount < 0)
                {
                    alert("有効な数値を入力してください。");
                    return;
                }

                if (betAmount > currentPoints)
                {
                    alert("ポイントが足りません。");
                    return;
                }

                const rawdice = [
                    Math.floor(Math.random() * 6) + 1,
                    Math.floor(Math.random() * 6) + 1,
                    Math.floor(Math.random() * 6) + 1,
                ];

                const dice = [...rawdice].sort((a, b) => a - b);
                let resultText = "";
                let pointChange = 0; // 最終的な収支

                if (dice[0] === 1 && dice[1] === 1 && dice[2] === 1)
                {
                    resultText = "ピンゾロ【5倍付け】";
                    pointChange = betAmount * 5;
                }
                else if (dice[0] === dice[1] && dice[1] === dice[2])
                {
                    resultText = `${dice[0]}のアラシ【3倍付け】`;
                    pointChange = betAmount * 3;
                }
                else if (dice[0] === 4 && dice[1] === 5 && dice[2] === 6)
                {
                    resultText = "シゴロ【2倍付け】";
                    pointChange = betAmount * 2;
                }
                else if (dice[0] === 1 && dice[1] === 2 && dice[2] === 3)
                {
                    resultText = "ヒフミ【2倍払い】";
                    pointChange = -(betAmount * 2);
                }
                else if (dice[0] === dice[1] || dice[1] === dice[2] || dice[0] === dice[2])
                {
                    const singleDice = dice.find((val, idx, arr) => arr.indexOf(val) === arr.lastIndexOf(val));
                    resultText = `${singleDice}の目【1倍付け】`;
                    pointChange = 0;
                }
                else
                {
                    resultText = "目なし【1倍払い】";
                    pointChange = -betAmount;
                }

                // ベット額が0の場合は変動なし
                if (betAmount === 0)
                {
                    pointChange = 0;
                }

                // 最後に一括で所持金を計算して更新
                const newPoints = currentPoints + pointChange;
                localStorage.setItem("user_points", newPoints);
                updatePointDisplay();

                chinchiroResult.textContent = `サイコロ: [ ${rawdice.join(", ")} ] → ${resultText}`;

                if (betAmount === 0)
                {
                    chinchiroPointChange.textContent = "変動pt：なし";
                }
                else
                {
                    chinchiroPointChange.textContent = `変動pt：${pointChange >= 0 ? '+' : ''}${pointChange}pt`;
                }
            }
        );
    }
}