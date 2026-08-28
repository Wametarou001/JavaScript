// Firebaseの設定情報(いじらないで)
const firebaseConfig = {
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

// リアルタイム監視：データベースの値が変わったら全員の画面で自動更新
db.ref("counts/iine").on("value", (snapshot) => {
    iine_count_display.textContent = snapshot.val() || 0;
});

db.ref("counts/waruine").on("value", (snapshot) => {
    waruine_count_display.textContent = snapshot.val() || 0;
});

// 「良いね！」ボタンの処理
iine_button.addEventListener("click", () => {
    alert("良いね！");
    // Firebaseのデータベースのカウントを+1する
    db.ref("counts/iine").transaction((current) => (current || 0) + 1);
});

// 「悪いね！」ボタンの処理
waruine_button.addEventListener("click", () => {
    alert("悪いね！");
    // Firebaseのデータベースのカウントを+1する
    db.ref("counts/waruine").transaction((current) => (current || 0) + 1);
});

// 計算処理
const calcButton = document.getElementById("calc_button");

calcButton.addEventListener("click", () => {
    const a = document.getElementById("num1").value;
    const b = document.getElementById("num2").value;

    const valA = a ? math.evaluate(a) : 0;
    const valB = b ? math.evaluate(b) : 0;

    const result = valA + valB;

    document.getElementById("result").textContent = result;
});