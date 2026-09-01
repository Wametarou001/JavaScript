import { initOmikuji } from './omikuji.js';
import { initRollDice } from './rollDice.js'

// 読み込み完了時に継承機能を有効化
document.addEventListener("DOMContentLoaded", () => {
    initOmikuji();
    initRollDice();
});

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

    expr = expr.replace(/良いね！|いいね！/g, "iine");
    expr = expr.replace(/悪いね！|わるいね！/g, "waruine");
    expr = expr.replace(/良し悪し|よしあし/g, "yosiasi");
    expr = expr.replace(/延べ訪問数|訪問数/g, "total_visits");

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

        const result = math.evaluate(expr, scope);
        document.getElementById("result").textContent = result;
    } catch (error) {
        document.getElementById("result").textContent = "";
    }
}

// データベースの値が変わったら自動更新
db.ref("counts/iine").on("value", (snapshot) =>
    {
        iine_count_display.textContent = snapshot.val() || 0;
        updateYosiasi();
        calculate();
    }
);

db.ref("counts/waruine").on("value", (snapshot) =>
    {
        waruine_count_display.textContent = snapshot.val() || 0;
        updateYosiasi();
        calculate();
    }
);

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

        const daikyoProbability = 0.1;
        if (Math.random() < daikyoProbability)
        {
            // ※もし「悪いね！」からの大凶演出もomikuji.js側に寄せたい場合は関数としてexportして呼び出すことも可能です
            alert("悪いね！！！！！！！大凶！！！！！");
            return;
        }
        alert("悪いね！");
    }
);

num1Input.addEventListener("input", calculate);

// ---合計訪問数---
db.ref("counts/total_visits").transaction((current) => (current || 0) + 1);

db.ref("counts/total_visits").on("value", (snapshot) =>
    {
        totalVisitDisplay.textContent = snapshot.val() || 0;
        calculate();
    }
);

// --- ちんちろ ---
const chinchiroButton = document.getElementById("chinchiro_button");
const chinchiroResult = document.getElementById("chinchiro_result");

if (chinchiroButton)
{
    chinchiroButton.addEventListener("click", () =>
        {
            const rawdice =
            [
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1,
            ];

            const dice = [...rawdice].sort((a, b) => a - b);
            let resultText = "";

            if (dice[0] === 1 && dice[1] === 1 && dice[2] === 1) {
                resultText = "ピンゾロ【5倍付け】";
            } else if (dice[0] === dice[1] && dice[1] === dice[2]) {
                resultText = `${dice[0]}のアラシ【3倍付け】`;
            } else if (dice[0] === 4 && dice[1] === 5 && dice[2] === 6) {
                resultText = "シゴロ【2倍付け】";
            } else if (dice[0] === 1 && dice[1] === 2 && dice[2] === 3) {
                resultText = "ヒフミ【2倍払い】";
            } else if (dice[0] === dice[1] || dice[1] === dice[2] || dice[0] === dice[2]) {
                const uniqueDice = dice.filter((val, idx, arr) => arr.indexOf(val) !== arr.lastIndexOf(val));
                const singleDice = dice.find((val, idx, arr) => arr.indexOf(val) === arr.lastIndexOf(val));
                resultText = `${singleDice}の目【1倍づけ】`;
            } else {
                resultText = "目なし【1倍払い】";
            }

            chinchiroResult.textContent = `サイコロ: [ ${rawdice.join(", ")} ] → ${resultText}`;
        }
    );
}

const nextPageButton = document.getElementById('next_button');
if (nextPageButton) {
    nextPageButton.addEventListener('click', () => {
        window.location.href = 'nextPage/next.html';
    });
}