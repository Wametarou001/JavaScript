// Firebaseの設定情報(いじらないで)
const firebaseConfig =
{
    apiKey: "AIzaSyDsvGW6ysezOkWjbhX3UrMUdUk_v0QWLDs",
    authDomain: "iine-waruine.firebaseapp.com",
    projectId: "iine-waruine",
    storageBucket: "iine-waruine.firebasestorage.app",
    messagingSenderId: "863788990919",
    appId: "1:863788990919:web:2cd75b201f59ce4e6259e2",
    databaseURL: "https://iine-waruine-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Firebaseの初期化
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 処理
const iine_button = document.getElementById("iine_button");
const waruine_button = document.getElementById("waruine_button");

const iine_count_display = document.getElementById("iine_count");
const waruine_count_display = document.getElementById("waruine_count");
const yosiasi_count_display = document.getElementById("yosiasi_count");
const totalVisitDisplay = document.getElementById("total_visit_count");
const num1Input = document.getElementById("num1");

// 良し悪し計算
function updateYosiasi()
{
    const iine = Number(iine_count_display.textContent) || 0;
    const waruine = Number(waruine_count_display.textContent) || 0;

    yosiasi_count_display.textContent = iine - waruine;
}

// --- 計算を実行する共通関数 ---
function calculate()
{
    let expr = num1Input.value;

    // 入力された日本語の別名を、コードで使える英語の変数名に自動で置き換える
    expr = expr.replace(/良いね！|いいね！/g, "iine");
    expr = expr.replace(/悪いね！|わるいね！/g, "waruine");
    expr = expr.replace(/良し悪し|よしあし/g, "yosiasi");
    expr = expr.replace(/延べ訪問数|訪問数/g, "total_visits");

    // 現在の画面上のカウントを取得して変数スコープにまとめる
    const scope = {
        iine: Number(iine_count_display.textContent) || 0,
        waruine: Number(waruine_count_display.textContent) || 0,
        yosiasi: Number(yosiasi_count_display.textContent) || 0,
        total_visits: Number(totalVisitDisplay.textContent) || 0
    };

    try {
        if (!expr.trim())
        {
            document.getElementById("result").textContent = "";
            return;
        }

        // 数式と変数スコープを渡して計算
        const result = math.evaluate(expr, scope);
        document.getElementById("result").textContent = result;
    } catch (error) {
        document.getElementById("result").textContent = "";
    }
}

// リアルタイム監視：データベースの値が変わったら全員の画面で自動更新 ＆ 計算結果も連動
db.ref("counts/iine").on("value", (snapshot) =>
    {
        iine_count_display.textContent = snapshot.val() || 0;
        updateYosiasi();
        calculate(); // カウントが変わったら計算をやり直す
    }
);

db.ref("counts/waruine").on("value", (snapshot) =>
    {
        waruine_count_display.textContent = snapshot.val() || 0;
        updateYosiasi();
        calculate(); // カウントが変わったら計算をやり直す
    }
);

// --- 共通：大凶（反転）を適用するメソッド ---
function applyDaikyo(resultText)
{
    omikujiResult.textContent = resultText;

    document.documentElement.classList.add("daikyo");
    document.body.classList.add("daikyo");

    // 今日引いた日付と結果をブラウザに保存
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem("last_omikuji_date", today);
    localStorage.setItem("last_omikuji_result", resultText);
}

// --- 共通：通常状態に戻すメソッド ---
function clearDaikyo()
{
    document.documentElement.classList.remove("daikyo");
    document.body.classList.remove("daikyo");
}

// 「良いね！」ボタンの処理
iine_button.addEventListener("click", () =>
    {
        alert("良いね！");
        db.ref("counts/iine").transaction((current) => (current || 0) + 1);
    }
);

// 「悪いね！」ボタンの処理
waruine_button.addEventListener("click", () =>
    {
        db.ref("counts/waruine").transaction((current) => (current || 0) + 1);

        // 確率で強制大凶（例: 10% = 0.1）
        const daikyoProbability = 0.1;
        if (Math.random() < daikyoProbability)
        {
            applyDaikyo("大凶！！！");
            alert("悪いね！！！！！！！大凶！！！！！");
            return;
        }
        alert("悪いね！");
    }
);

// 入力欄に文字を打ったときも計算を実行
num1Input.addEventListener("input", calculate);

// ---合計訪問数---
db.ref("counts/total_visits").transaction((current) => (current || 0) + 1);

db.ref("counts/total_visits").on("value", (snapshot) =>
    {
        totalVisitDisplay.textContent = snapshot.val() || 0;
        calculate(); // 訪問数が変わったときも計算をやり直す
    }
);

// ---今日の運勢---
const omikujiButton = document.getElementById("omikuji_button");
const omikujiResult = document.getElementById("omikuji_result");

const fortunes =
[
    "大吉！！！！！",
    "吉！！！",
    "中吉！！",
    "小吉！",
    "末吉！！",
    "凶！！！",
    "大凶！！！！！"
];

// 画面を開いたときすでにおみくじを引いていれば結果を再表示
const todayStr = new Date().toISOString().split('T')[0];
const savedDate = localStorage.getItem("last_omikuji_date");
const savedResult = localStorage.getItem("last_omikuji_result");

if (savedDate === todayStr && savedResult)
{
    omikujiResult.textContent = savedResult;

    if (savedResult.includes("大凶"))
    {
        document.documentElement.classList.add("daikyo");
        document.body.classList.add("daikyo");
    }
}

omikujiButton.addEventListener("click", () =>
    {
        const today = new Date().toISOString().split('T')[0];
        const lastDrawnDate = localStorage.getItem("last_omikuji_date");

        if (lastDrawnDate === today)
        {
            alert("おみくじは一日一回まで！また明日引いてね！");
            return;
        }

        // ランダムで結果を選ぶ
        const randomIndex = Math.floor(Math.random() * fortunes.length);
        const result = fortunes[randomIndex];

        if (result.includes("大凶"))
        {
            applyDaikyo(result);
        }
        else
        {
            omikujiResult.textContent = result;
            clearDaikyo();

            localStorage.setItem("last_omikuji_date", today);
            localStorage.setItem("last_omikuji_result", result);
        }
    }
);

// --- ちんちろ ---
const chinchiroButton = document.getElementById("chinchiro_button");
const chinchiroResult = document.getElementById("chinchiro_result");

if (chinchiroButton)
{
    chinchiroButton.addEventListener("click", () =>
        {
            // さいころを振る
            const rawdice =
            [
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1,
            ];

            const dice = [...rawdice].sort((a, b) => a - b);

            let resultText = "";

            // 役の判定
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
            else if (dice[0] === dice[1])
            {
                resultText = `${dice[2]}の目【1倍づけ】`;
            }
            else if (dice[1] === dice[2])
            {
                resultText = `${dice[0]}の目【1倍づけ】`;
            }
            else if (dice[0] === dice[2])
            {
                resultText = `${dice[1]}の目【1倍づけ】`;
            }
            else
            {
                resultText = "目なし【1倍払い】";
            }

            // 結果を表示
            chinchiroResult.textContent = `サイコロ: [ ${rawdice.join(", ")} ] → ${resultText}`;
        }
    );
}