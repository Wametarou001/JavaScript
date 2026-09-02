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
    "凶！！！":1,
    "大凶！！！！！": 0,
};

// 画面読み込み時に現在のポイントを画面に反映する関数
function updatePointDisplay()
{
    if (!pointDisplay) return;
    const currentPoints = Number(localStorage.getItem("user_points")) || 0;
    pointDisplay.textContent = currentPoints;
}

// --- 大凶で反転を適用するメソッド ---
export function applyDaikyo(resultText)
{
    if (omikujiResult)
    {
        omikujiResult.textContent = resultText;
    }
    // リセット用クラスを外し、大凶クラスを付与
    document.documentElement.classList.remove("resetDaikyo");
    document.body.classList.remove("resetDaikyo");
    document.documentElement.classList.add("daikyo");
    document.body.classList.add("daikyo");

    // 大凶のときだけボタンを表示する
    if (resetDaikyoButton)
    {
        resetDaikyoButton.style.display = "block";
    }

    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem("last_omikuji_date", today);
    localStorage.setItem("last_omikuji_result", resultText);
}

// --- 通常状態に戻すメソッド ---
function clearDaikyo()
{
    document.documentElement.classList.remove("daikyo");
    document.body.classList.remove("daikyo");
    // 大凶の見た目をリセットするクラスを付与
    document.documentElement.classList.add("resetDaikyo");
    document.body.classList.add("resetDaikyo");

    // リセットしたらボタンを隠す
    if (resetDaikyoButton)
    {
        resetDaikyoButton.style.display = "none";
    }
}

export function initOmikuji()
{
    if (!omikujiButton || !omikujiResult) return;

    // 起動時にポイント表示を更新
    updatePointDisplay();

    // 見た目をリセットするボタンが押されたときの処理
    if (resetDaikyoButton)
    {
        resetDaikyoButton.addEventListener("click", () =>
        {
            clearDaikyo();
        });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const savedDate = localStorage.getItem("last_omikuji_date");
    const savedResult = localStorage.getItem("last_omikuji_result");

    if (savedDate === todayStr && savedResult)
    {
        omikujiResult.textContent = savedResult;

        if (savedResult.includes("大凶"))
        {
            document.documentElement.classList.remove("resetDaikyo");
            document.body.classList.remove("resetDaikyo");
            document.documentElement.classList.add("daikyo");
            document.body.classList.add("daikyo");

            //リロード時にも大凶ならボタンを表示
            if (resetDaikyoButton)
            {
                resetDaikyoButton.style.display = "block";
            }
        }
    }

    omikujiButton.addEventListener
    (
        "click", () =>
        {
            const today = new Date().toISOString().split('T')[0];
            const lastDrawnDate = localStorage.getItem("last_omikuji_date");

            if (lastDrawnDate === today)
            {
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

            if (result.includes("大凶"))
            {
                applyDaikyo(result);
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

                localStorage.setItem("last_omikuji_date", today);
                localStorage.setItem("last_omikuji_result", result);
            }

            alert(`${result}！ +${earnedPoints}pt （合計: ${newPoints}pt）`);
        }
    );

    // デバッグ用
    window.iineWaruineSiteDebug =
    {
        // おみくじ制限リセット
        omikuji: {
            reset: function()
            {
                localStorage.removeItem("last_omikuji_date");
                localStorage.removeItem("last_omikuji_result");
                console.log("おみくじの制限をリセットしました。ページを再読み込みしてください。");
            }
        },

        // ポイント操作
        points: {
            // 指定したポイントを加算
            add: function(amount)
            {
                // math.jsが読み込まれている前提で、文字列なら計算、数値ならそのまま使う
                const evaluatedAmount = typeof amount === 'string' ? math.evaluate(amount) : amount;

                const currentPoints = Number(localStorage.getItem("user_points")) || 0;
                const newPoints = currentPoints + evaluatedAmount;
                localStorage.setItem("user_points", newPoints);
                updatePointDisplay();
                console.log(`${evaluatedAmount}ptを追加しました。（合計: ${newPoints}pt）`);
            },
            // ポイントを指定した数値に書き換える
            set: function(amount)
            {
                const evaluatedAmount = typeof amount === 'string' ? math.evaluate(amount) : amount;

                localStorage.setItem("user_points", evaluatedAmount);
                updatePointDisplay();
                console.log(`ポイントを ${evaluatedAmount}pt に設定しました。`);
            }
        }
    };
}