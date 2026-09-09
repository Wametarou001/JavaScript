import { db, auth } from "../common/firebase.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

const chinchiroButton = document.getElementById("chinchiro_button");
const chinchiroResult = document.getElementById("chinchiro_result");
const chinchiroPointChange = document.getElementById("chinchiro_point_change");
const chinchiroBetInput = document.getElementById("chinchiro_bet");
const pointDisplay = document.getElementById("user_points");

let currentUserUid = null;

// ログイン状態を監視してUIDを保持する
onAuthStateChanged(auth, async (user) =>
{
    if (user)
    {
        currentUserUid = user.uid;
        await updatePointDisplay();
    }
    else
    {
        currentUserUid = null;
        updatePointDisplay();
    }
});

// 現在のポイントを取得する関数(ログインしていない場合LocalStrageを参照)
async function getCurrentPoints()
{
    if (currentUserUid)
    {
        const userRef = ref(db, "users/" + currentUserUid);
        const snapshot = await get(userRef);
        if (snapshot.exists())
        {
            return Number(snapshot.val().points) || 0;
        }
        return 0;
    }
    else
    {
        return Number(localStorage.getItem("user_points")) || 0;
    }
}

// ポイントを保存する関数（FirebaseまたはlocalStorage）
async function saveNewPoints(newPoints)
{
    if (currentUserUid)
    {
        const userRef = ref(db, "users/" + currentUserUid);
        await update(userRef, {
            points: newPoints
        });
    }
    else
    {
        localStorage.setItem("user_points", newPoints);
    }
}

// 画面のポイント表示を更新する関数
async function updatePointDisplay()
{
    if (!pointDisplay) return;
    const currentPoints = await getCurrentPoints();
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
            "click", async () =>
            {
                const currentPoints = await getCurrentPoints();

                // 新規ゲームの開始（または1回目が終わった後）の判定
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
                let isFinished = false;

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
                        if (currentRollCount >= maxRolls)
                        {
                            resultText = `${currentRollCount}回目 目無し【1倍払い】`;
                            pointChange = -currentBetAmount;
                            isFinished = true;
                        }
                        else
                        {
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
                    await saveNewPoints(newPoints);
                    await updatePointDisplay();

                    chinchiroResult.textContent = `サイコロ: [ ${rawdice.join(", ")} ] → ${resultText}`;

                    if (currentBetAmount === 0)
                    {
                        chinchiroPointChange.textContent = "変動pt：なし";
                    }
                    else
                    {
                        chinchiroPointChange.textContent = `変動pt：${pointChange >= 0 ? '+' : ''}${pointChange}pt`;
                    }

                    currentRollCount = 0;
                }
                else
                {
                    chinchiroResult.textContent = `サイコロ: [ ${rawdice.join(", ")} ] → ${resultText} (振り直し)`;
                    chinchiroPointChange.textContent = "変動pt：計算中...";
                }
            }
        );
    }
}