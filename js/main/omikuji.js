import { modifyBalance, getAllBalances } from '../common/wallet.js';
import { db, auth } from "../common/firebase.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

const omikujiButton = document.getElementById("omikuji_button");
const omikujiResult = document.getElementById("omikuji_result");
const omikujiResultPts = document.getElementById("omikuji_result_pts");
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
        await loadUserData();
    }
    else
    {
        currentUserUid = null;
        updatePointDisplayLocal();
        checkLocalOmikujiState();
    }
});

// ユーザーデータ（おみくじ履歴とポイント）を読み込む関数
async function loadUserData() {
    if (!currentUserUid) return;

    const userRef = ref(db, "users/" + currentUserUid);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
        const data = snapshot.val();
        if (pointDisplay) {
            const balances = data.balances || {};
            pointDisplay.textContent = Number(balances.JPY) || 0;
        }

        const todayStr = new Date().toISOString().split('T')[0];
        if (data.last_omikuji_date === todayStr && data.last_omikuji_result) {
            const res = data.last_omikuji_result;
            const pts = fortunePoints[res] !== undefined ? fortunePoints[res] : 0;
            if (omikujiResult) omikujiResult.textContent = res;
            if (omikujiResultPts) omikujiResultPts.textContent = `+${pts}pt`;
            if (res.includes("大凶")) {
                applyDaikyo(res, false);
            }
        }
    } else {
        if (pointDisplay) pointDisplay.textContent = "0";
    }
}

// ローカルのポイント表示を更新
async function updatePointDisplayLocal()
{
    if (!pointDisplay) return;
    const balances = await getAllBalances();
    pointDisplay.textContent = Number(balances.JPY) || 0;
}

// ローカルの今日の結果をチェック
function checkLocalOmikujiState()
{
    const todayStr = new Date().toISOString().split('T')[0];
    const savedDate = localStorage.getItem("last_omikuji_date");
    const savedResult = localStorage.getItem("last_omikuji_result");

    if (savedDate === todayStr && savedResult)
    {
        const pts = fortunePoints[savedResult] !== undefined ? fortunePoints[savedResult] : 0;
        if (omikujiResult) omikujiResult.textContent = savedResult;
        if (omikujiResultPts) omikujiResultPts.textContent = `+${pts}pt`;
        if (savedResult.includes("大凶"))
        {
            applyDaikyo(savedResult, true);
        }
    }
}

// --- 大凶の反転を適用するメソッド ---
export function applyDaikyo(resultText, saveToLocal = true)
{
    const pts = fortunePoints[resultText] !== undefined ? fortunePoints[resultText] : 0;
    if (omikujiResult)
    {
        omikujiResult.textContent = resultText;
    }
    if (omikujiResultPts)
    {
        omikujiResultPts.textContent = `+${pts}pt`;
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

        // 1日1回制限のチェック（ログイン中・未ログイン共通）
        if (currentUserUid) {
            const userRef = ref(db, "users/" + currentUserUid);
            const snapshot = await get(userRef);
            const userData = snapshot.exists() ? snapshot.val() : {};
            if (userData.last_omikuji_date === today) {
                alert("おみくじは一日一回まで！また明日引いてね！");
                return;
            }
        } else {
            const lastDrawnDate = localStorage.getItem("last_omikuji_date");
            if (lastDrawnDate === today) {
                alert("おみくじは一日一回まで！また明日引いてね！");
                return;
            }
        }

        const fortunes = Object.keys(fortunePoints);
        const randomIndex = Math.floor(Math.random() * fortunes.length);
        const result = fortunes[randomIndex];
        const earnedPoints = fortunePoints[result];

        // wallet.jsの共通関数を使ってJPY（ポイント）を増やす
        const newPoints = await modifyBalance('JPY', earnedPoints);

        // どの日付におみくじを引いたかの記録を保存
        if (currentUserUid) {
            const userRef = ref(db, "users/" + currentUserUid);
            await update(userRef, {
                last_omikuji_date: today,
                last_omikuji_result: result
            });
        } else {
            localStorage.setItem("last_omikuji_date", today);
            localStorage.setItem("last_omikuji_result", result);
        }

        // 画面の表示を更新
        if (pointDisplay) {
            pointDisplay.textContent = newPoints;
        }

        // 結果とポイントをそれぞれの要素にセット
        if (omikujiResult) omikujiResult.textContent = result;
        if (omikujiResultPts) omikujiResultPts.textContent = `+${earnedPoints}pt`;

        if (result.includes("大凶"))
        {
            applyDaikyo(result, !currentUserUid);
        }
        else
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
    });
}