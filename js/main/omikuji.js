import { db, auth } from "../common/firebase.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

const omikujiButton = document.getElementById("omikuji_button");
const omikujiResult = document.getElementById("omikuji_result");
const pointDisplay = document.getElementById("user_points");
const resetDaikyoButton = document.getElementById("reset_daikyo_button");

const fortunePoints =
{
    "大吉！！！！！": 32,
    "吉！！！": 16,
    "中吉！！": 8,
    "小吉！": 4,
    "末吉！！": 2,
    "凶！！！": 1,
    "大凶！！！！！": 0,
};

let currentUserUid = null;

// ログイン状態の監視
onAuthStateChanged(auth, async (user) =>
{
    if (user)
    {
        currentUserUid = user.uid;
        // ログインしたらFirebaseからデータを読み込んで画面に反映
        await loadUserData();
    }
    else
    {
        currentUserUid = null;
        // 未ログインならlocalStorageから読み込む
        updatePointDisplayLocal();
        checkLocalOmikujiState();
    }
});

// Firebaseからデータを読み込む関数
async function loadUserData() {
    if (!currentUserUid) return;

    const userRef = ref(db, "users/" + currentUserUid);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
        const data = snapshot.val();
        if (pointDisplay) {
            pointDisplay.textContent = data.points || 0;
        }

        const todayStr = new Date().toISOString().split('T')[0];
        if (data.last_omikuji_date === todayStr && data.last_omikuji_result) {
            omikujiResult.textContent = data.last_omikuji_result;
            if (data.last_omikuji_result.includes("大凶")) {
                applyDaikyo(data.last_omikuji_result, false); // ローカル保存はスキップ
            }
        }
    } else {
        if (pointDisplay) pointDisplay.textContent = "0";
    }
}

// ローカルのポイント表示を更新
function updatePointDisplayLocal()
{
    if (!pointDisplay) return;
    const currentPoints = Number(localStorage.getItem("user_points")) || 0;
    pointDisplay.textContent = currentPoints;
}

// ローカルの今日の結果をチェック
function checkLocalOmikujiState()
{
    const todayStr = new Date().toISOString().split('T')[0];
    const savedDate = localStorage.getItem("last_omikuji_date");
    const savedResult = localStorage.getItem("last_omikuji_result");

    if (savedDate === todayStr && savedResult)
    {
        omikujiResult.textContent = savedResult;
        if (savedResult.includes("大凶"))
        {
            applyDaikyo(savedResult, true);
        }
    }
}

// --- 大凶で反転を適用するメソッド ---
export function applyDaikyo(resultText, saveToLocal = true)
{
    if (omikujiResult)
    {
        omikujiResult.textContent = resultText;
    }
    document.documentElement.classList.remove("resetDaikyo");
    document.body.classList.remove("resetDaikyo");
    document.documentElement.classList.add("daikyo");
    document.body.classList.add("daikyo");

    if (resetDaikyoButton)
    {
        resetDaikyoButton.style.display = "block";
    }

    if (saveToLocal) {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem("last_omikuji_date", today);
        localStorage.setItem("last_omikuji_result", resultText);
    }
}

// --- 通常状態に戻すメソッド ---
function clearDaikyo()
{
    document.documentElement.classList.remove("daikyo");
    document.body.classList.remove("daikyo");
    document.documentElement.classList.add("resetDaikyo");
    document.body.classList.add("resetDaikyo");

    if (resetDaikyoButton)
    {
        resetDaikyoButton.style.display = "none";
    }
}

export function initOmikuji()
{
    if (!omikujiButton || !omikujiResult) return;

    if (resetDaikyoButton)
    {
        resetDaikyoButton.addEventListener("click", () =>
            {
                clearDaikyo();
            }
        );
    }

    omikujiButton.addEventListener("click", async () =>
    {
        const today = new Date().toISOString().split('T')[0];
        const fortunes = Object.keys(fortunePoints);
        const randomIndex = Math.floor(Math.random() * fortunes.length);
        const result = fortunes[randomIndex];
        const earnedPoints = fortunePoints[result];

        let newPoints = 0;

        // ログインしている場合：Firebaseに保存
        if (currentUserUid)
        {
            const userRef = ref(db, "users/" + currentUserUid);
            const snapshot = await get(userRef);
            const userData = snapshot.exists() ? snapshot.val() : {};

            if (userData.last_omikuji_date === today)
            {
                alert("おみくじは一日一回まで！また明日引いてね！");
                return;
            }

            const currentPoints = Number(userData.points) || 0;
            newPoints = currentPoints + earnedPoints;

            // 既存データを保持しておみくじ結果だけ更新
            await update(userRef, {
                points: newPoints,
                last_omikuji_date: today,
                last_omikuji_result: result
            });
        }
        // 未ログインの場合：localStorageに保存
        else
        {
            const lastDrawnDate = localStorage.getItem("last_omikuji_date");
            if (lastDrawnDate === today)
            {
                alert("おみくじは一日一回まで！また明日引いてね！");
                return;
            }

            const currentPoints = Number(localStorage.getItem("user_points")) || 0;
            newPoints = currentPoints + earnedPoints;
            localStorage.setItem("user_points", newPoints);
            localStorage.setItem("last_omikuji_date", today);
            localStorage.setItem("last_omikuji_result", result);
        }

        // 画面の表示を更新
        if (pointDisplay) {
            pointDisplay.textContent = newPoints;
        }

        if (result.includes("大凶"))
        {
            applyDaikyo(result, !currentUserUid);
        }
        else
        {
            omikujiResult.textContent = result;
            document.documentElement.classList.remove("daikyo");
            document.body.classList.remove("daikyo");
            document.documentElement.classList.add("resetDaikyo");
            document.body.classList.add("resetDaikyo");
            if (resetDaikyoButton)
            {
                resetDaikyoButton.style.display = "none";
            }
        }

        alert(`${result} +${earnedPoints}pt （合計: ${newPoints}pt）`);
    });
}