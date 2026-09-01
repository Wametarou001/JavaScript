const omikujiButton = document.getElementById("omikuji_button");
const omikujiResult = document.getElementById("omikuji_result");
// ポイントを表示する要素（HTML側に <span id="user_points">0</span> などを置いておく想定）
const pointDisplay = document.getElementById("user_points");

const fortunePoints = {
    "大吉！！！！！": 100,
    "吉！！！": 50,
    "中吉！！": 30,
    "小吉！": 10,
    "末吉！！": 5,
    "凶！！！": 0,
    "大凶！！！！！": -50
};

// 画面読み込み時に現在のポイントを画面に反映する関数
function updatePointDisplay() {
    if (!pointDisplay) return;
    const currentPoints = Number(localStorage.getItem("user_points")) || 0;
    pointDisplay.textContent = currentPoints;
}

// --- 大凶で反転を適用するメソッド ---
function applyDaikyo(resultText) {
    if (omikujiResult) {
        omikujiResult.textContent = resultText;
    }
    document.documentElement.classList.add("daikyo");
    document.body.classList.add("daikyo");

    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem("last_omikuji_date", today);
    localStorage.setItem("last_omikuji_result", resultText);
}

// --- 通常状態に戻すメソッド ---
function clearDaikyo() {
    document.documentElement.classList.remove("daikyo");
    document.body.classList.remove("daikyo");
}

export function initOmikuji() {
    if (!omikujiButton || !omikujiResult) return;

    // 起動時にポイント表示を更新
    updatePointDisplay();

    const todayStr = new Date().toISOString().split('T')[0];
    const savedDate = localStorage.getItem("last_omikuji_date");
    const savedResult = localStorage.getItem("last_omikuji_result");

    if (savedDate === todayStr && savedResult) {
        omikujiResult.textContent = savedResult;

        if (savedResult.includes("大凶")) {
            document.documentElement.classList.add("daikyo");
            document.body.classList.add("daikyo");
        }
    }

    omikujiButton.addEventListener("click", () => {
        const today = new Date().toISOString().split('T')[0];
        const lastDrawnDate = localStorage.getItem("last_omikuji_date");

        if (lastDrawnDate === today) {
            alert("おみくじは一日一回まで！また明日引いてね！");
            return;
        }

        const fortunes = Object.keys(fortunePoints);
        const randomIndex = Math.floor(Math.random() * fortunes.length);
        const result = fortunes[randomIndex];
        const earnedPoints = fortunePoints[result];

        // localStorageから現在のポイントを読み込んで加算し、保存する
        const currentPoints = Number(localStorage.getItem("user_points")) || 0;
        const newPoints = currentPoints + earnedPoints;
        localStorage.setItem("user_points", newPoints);

        // 画面の表示を更新
        updatePointDisplay();

        if (result.includes("大凶")) {
            applyDaikyo(result);
        } else {
            omikujiResult.textContent = result;
            clearDaikyo();

            localStorage.setItem("last_omikuji_date", today);
            localStorage.setItem("last_omikuji_result", result);
        }

        alert(`${result}！ +${earnedPoints}pt （合計: ${newPoints}pt）`);
    });

    // デバッグ用
    window.mySiteDebug = {
    resetOmikuji: function()
        {
            localStorage.removeItem("last_omikuji_date");
            localStorage.removeItem("last_omikuji_result");
            console.log("おみくじの制限をリセットしました！ページを再読み込みしてください。");
        }
    };
}