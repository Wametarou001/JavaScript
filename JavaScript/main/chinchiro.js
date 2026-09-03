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

// 連続振りの状態を保持する変数
let currentBetAmount = 0;
let currentRollCount = 0;
const maxRolls = 3;

export function initChinChiro()
{
    if (chinchiroButton)
    {
        chinchiroButton.addEventListener
        (
            "click", () =>
            {
                const currentPoints = Number(localStorage.getItem("user_points")) || 0;

                // 追加：新規ゲームの開始（または1回目が終わった後）の判定
                if (currentRollCount === 0)
                {
                    const betInputVal = chinchiroBetInput.value.trim();
                    currentBetAmount = betInputVal === "" ? 0 : Math.floor(Number(betInputVal));

                    if (isNaN(currentBetAmount) || currentBetAmount < 0)
                    {
                        alert("有効な数値を入力してください。");
                        return;
                    }

                    if (currentBetAmount > currentPoints)
                    {
                        alert("ポイントが足りません。");
                        return;
                    }
                }

                // 振る回数をカウントアップ
                currentRollCount++;

                const rawdice =
                [
                    Math.floor(Math.random() * 6) + 1,
                    Math.floor(Math.random() * 6) + 1,
                    Math.floor(Math.random() * 6) + 1,
                ];
                const dice = [...rawdice].sort((a, b) => a - b);

                let resultText = "";
                let pointChange = 0;
                let isFinished = false; // 今回のクリックでゲームが終了するかどうか

                // 掛け金が0または未入力の場合は、常に1回目で強制終了
                if (currentBetAmount === 0)
                {
                    if (dice[0] === 1 && dice[1] === 1 && dice[2] === 1)
                    {
                        resultText = "ピンゾロ【5倍付け】";
                    }
                    else if (dice[0] === dice[1] && dice[1] === dice[2])
                    {
                        resultText = `${dice[0]}のアラシ【3倍付け】`;
                    }
                    else if (dice[0] === 4 && dice[1] === 5 && dice[2] === 6)
                    {
                        resultText = "シゴロ【2倍付け】";
                    }
                    else if (dice[0] === 1 && dice[1] === 2 && dice[2] === 3)
                    {
                        resultText = "ヒフミ【2倍払い】";
                    }
                    else if (dice[0] === dice[1] || dice[1] === dice[2] || dice[0] === dice[2])
                    {
                        const singleDice = dice.find((val, idx, arr) => arr.indexOf(val) === arr.lastIndexOf(val));
                        resultText = `${singleDice}の目【1倍付け】`;
                    }
                    else
                    {
                        resultText = "目なし【1倍払い】";
                    }
                    pointChange = 0;
                    isFinished = true;
                }
                else
                {
                    // ポイントを賭けている場合の判定
                    if (dice[0] === 1 && dice[1] === 1 && dice[2] === 1)
                    {
                        resultText = "ピンゾロ【5倍付け】";
                        pointChange = currentBetAmount * 5;
                        isFinished = true;
                    }
                    else if (dice[0] === dice[1] && dice[1] === dice[2])
                    {
                        resultText = `${dice[0]}のアラシ【3倍付け】`;
                        pointChange = currentBetAmount * 3;
                        isFinished = true;
                    }
                    else if (dice[0] === 4 && dice[1] === 5 && dice[2] === 6)
                    {
                        resultText = "シゴロ【2倍付け】";
                        pointChange = currentBetAmount * 2;
                        isFinished = true;
                    }
                    else if (dice[0] === 1 && dice[1] === 2 && dice[2] === 3)
                    {
                        resultText = "ヒフミ【2倍払い】";
                        pointChange = -(currentBetAmount * 2);
                        isFinished = true;
                    }
                    else if (dice[0] === dice[1] || dice[1] === dice[2] || dice[0] === dice[2])
                    {
                        const singleDice = dice.find((val, idx, arr) => arr.indexOf(val) === arr.lastIndexOf(val));
                        resultText = `${singleDice}の目【1倍付け】`;
                        pointChange = 0;
                        isFinished = true;
                    }
                    else
                    {
                        // 目なしの場合
                        if (currentRollCount >= maxRolls)
                        {
                            // 3回目も目なしだった場合
                            resultText = `${currentRollCount}回目 目無し【1倍払い】`;
                            pointChange = -currentBetAmount;
                            isFinished = true;
                        }
                        else
                        {
                            // 1回目または2回目で目なしだった場合
                            resultText = `${currentRollCount}回目 目無し`;
                            pointChange = 0;
                            isFinished = false;
                        }
                    }
                }

                // ゲームが終了したときのみポイントを変動・保存する
                if (isFinished)
                {
                    const newPoints = currentPoints + pointChange;
                    localStorage.setItem("user_points", newPoints);
                    updatePointDisplay();

                    if (currentBetAmount === 0 || currentRollCount === 1)
                    {
                        chinchiroResult.textContent = `サイコロ: [ ${rawdice.join(", ")} ] → ${resultText}`;
                    }
                    else
                    {
                        chinchiroResult.textContent = `サイコロ: [ ${rawdice.join(", ")} ] → ${resultText}`;
                    }

                    if (currentBetAmount === 0)
                    {
                        chinchiroPointChange.textContent = "変動pt：なし";
                    }
                    else
                    {
                        chinchiroPointChange.textContent = `変動pt：${pointChange >= 0 ? '+' : ''}${pointChange}pt`;
                    }

                    // ゲーム終了なので回数をリセットして次回のボタンクリックに備える
                    currentRollCount = 0;
                }
                else
                {
                    // まだ振り直せる（目なしで2回目・3回目を迎える）場合
                    chinchiroResult.textContent = `サイコロ: [ ${rawdice.join(", ")} ] → ${resultText} (振り直し)`;
                    chinchiroPointChange.textContent = "変動pt：計算中...";
                }
            }
        );
    }
}