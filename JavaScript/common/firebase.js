import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js"; // FireBaseの基本機能
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js"; // ログイン機能

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

// 初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

/** Googleのログイン認証を実行する関数 */
export function loginWithGoogle()
{
    signInWithPopup(auth, provider) // Googleログインのポップアップ
    .then
    (
        (result) =>
        {
            const user = result.user;

            console.log("ログイン成功:", user.displayName, user.email);
            alert("Googleでログインしました。");
        }
    )
    .catch
    (
        (error) =>
        {
            console.error("ログイン失敗:", error.code, error.message);
            alert("ログインに失敗しました:" + error.message);
        }
    );
}

// 読み込み時やリロード時にログイン状態を維持
onAuthStateChanged(auth, (user) =>
{
    const googleLoginButton = document.getElementById("google_login_button");
    const userProfile = document.getElementById("user_profile");
    const userIcon = document.getElementById("user_icon");
    const userName = document.getElementById("user_name");

    if (user)
    {
        // === ログインしているとき ===
        if (googleLoginButton)
        {
            googleLoginButton.style.display = "none"; // ログインボタンを隠す
        }
        if (userProfile && userIcon && userName)
        {
            userIcon.src = user.photoURL || "";
            userName.textContent = user.displayName;
            userProfile.style.display = "flex"; // プロフィールを表示する
        }
    }
    else
    {
        // === ログアウトしているとき ===
        if (userProfile)
        {
            userProfile.style.display = "none"; // プロフィールを隠す
        }
        if (googleLoginButton)
        {
            googleLoginButton.style.display = "block";
        }
    }
});

window.loginWithGoogle = loginWithGoogle;