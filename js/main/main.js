import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";

import { initOmikuji, applyDaikyo } from './omikuji.js';
import { initRollDice } from './rollDice.js';
import { initChinChiro } from './chinchiro.js';
import { loginWithGoogle } from '../common/firebase.js';
import { initDebug } from "../common/debug.js";

// 読み込み完了時に機能を有効化
document.addEventListener("DOMContentLoaded", () => {
    initOmikuji();
    initRollDice();
    initChinChiro();
});

// Firebaseの設定情報
const firebaseConfig = {
    apiKey: "AIzaSyDsvGW6ysezOkWjbhX3UrMUdUk_v0QWLDs",
    authDomain: "iine-waruine.firebaseapp.com",
    projectId: "iine-waruine",
    storageBucket: "iine-waruine.firebasestorage.app",
    messagingSenderId: "863788990919",
    appId: "1:863788990919:web:2cd75b201f59ce4e6259e2",
    databaseURL: "https://iine-waruine-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// 初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Googleログインボタン
const loginButton = document.getElementById("google_login_button");
if (loginButton) {
    loginButton.addEventListener("click", () => {
        loginWithGoogle();
    });
}

// 要素の取得
const iine_button = document.getElementById("iine_button");
const waruine_button = document.getElementById("waruine_button");
const iine_count_display = document.getElementById("iine_count");
const waruine_count_display = document.getElementById("waruine_count");
const yosiasi_count_display = document.getElementById("yosiasi_count");
const totalVisitDisplay = document.getElementById("total_visit_count");
const num1Input = document.getElementById("num1");

function updateYosiasi() {
    const iine = Number(iine_count_display.textContent) || 0;
    const waruine = Number(waruine_count_display.textContent) || 0;
    yosiasi_count_display.textContent = iine - waruine;
}

function calculate() {
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
        if (!expr.trim()) {
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
onValue(ref(db, "counts/iine"), (snapshot) => {
    iine_count_display.textContent = snapshot.val() || 0;
    updateYosiasi();
    calculate();
});

onValue(ref(db, "counts/waruine"), (snapshot) => {
    waruine_count_display.textContent = snapshot.val() || 0;
    updateYosiasi();
    calculate();
});

// 「良いね！」ボタンの処理
if (iine_button) {
    iine_button.addEventListener("click", () => {
        alert("良いね！");
        // ▼ transaction -> runTransaction に変更
        runTransaction(ref(db, "counts/iine"), (current) => (current || 0) + 1);
    });
}

// 「悪いね！」ボタンの処理
if (waruine_button) {
    waruine_button.addEventListener("click", () => {
        // ▼ transaction -> runTransaction に変更
        runTransaction(ref(db, "counts/waruine"), (current) => (current || 0) + 1);

        const daikyoProbability = 0.1;
        if (Math.random() < daikyoProbability) {
            applyDaikyo("大凶！！！！！");
            alert("悪いね！！！！！！！大凶！！！！！");
            return;
        }
        alert("悪いね！");
    });
}

if (num1Input) {
    num1Input.addEventListener("input", calculate);
}

// ---合計訪問数---
// ▼ transaction -> runTransaction に変更
runTransaction(ref(db, "counts/total_visits"), (current) => (current || 0) + 1);

onValue(ref(db, "counts/total_visits"), (snapshot) => {
    totalVisitDisplay.textContent = snapshot.val() || 0;
    calculate();
});

const nextPageButton = document.getElementById('next_button');
if (nextPageButton) {
    nextPageButton.addEventListener('click', () => {
        window.location.href = './next.html';
    });
}

initDebug(auth);