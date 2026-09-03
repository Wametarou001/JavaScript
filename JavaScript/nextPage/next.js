import { db, auth } from "../common/firebase.js";
import { ref, get, update, set } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

const mainPageButton = document.getElementById('main_button');

if (mainPageButton)
{
    mainPageButton.addEventListener
    (
        'click', () =>
        {
            window.location.href = './index.html';
        }
    );
}

// シリアルコードの定義
const serialCodes =
{
    "超良いね！": 1000,
};

let currentUserUid = null;

// ログイン状態の監視
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

// 現在のポイントを取得する関数
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

// ポイントを保存する関数
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
    const pointDisplay = document.getElementById("user_points");
    if (!pointDisplay) return;
    const currentPoints = await getCurrentPoints();
    pointDisplay.textContent = currentPoints;
}

// シリアルコードの処理
async function SerialCodeSystem(code)
{
    const trimmedCode = code.trim();

    if (!serialCodes.hasOwnProperty(trimmedCode))
    {
        alert("無効なシリアルコードです。");
        return;
    }

    const rewardAmount = serialCodes[trimmedCode];
    // ログイン中の場合：Firebaseで既に使用済みかチェック
    if (currentUserUid)
    {
        const userRef = ref(db, "users/" + currentUserUid);
        const snapshot = await get(userRef);
        const userData = snapshot.exists() ? snapshot.val() : {};
        const usedCodes = userData.used_codes || {};

        if (usedCodes[trimmedCode] === true)
        {
            alert("このシリアルコードはすでに使用済みです。");
            return;
        }

        // 使用済みフラグを立ててポイントを加算
        usedCodes[trimmedCode] = true;
        const currentPoints = Number(userData.points) || 0;
        const newPoints = currentPoints + rewardAmount;

        await update(userRef,
            {
            points: newPoints,
            [`used_codes/${trimmedCode}`]: true
            });
    }
    // 未ログインの場合：localStorageで既に使用済みかチェック＆保存
    else
    {
        const storageKey = `used_code_${trimmedCode}`;
        if (localStorage.getItem(storageKey) === "true")
        {
            alert("このシリアルコードはすでに使用済みです。");
            return;
        }

        const currentPoints = Number(localStorage.getItem("user_points")) || 0;
        const newPoints = currentPoints + rewardAmount;

        localStorage.setItem("user_points", newPoints);
        localStorage.setItem(storageKey, "true");
    }

    await updatePointDisplay();
    alert(`シリアルコードを入力しました。 ${rewardAmount}pt を獲得しました。`);
}

const serialInput = document.getElementById("serial_input");
const serialButton = document.getElementById("serial_button");

if (serialButton && serialInput)
{
    serialButton.addEventListener("click", async () =>
    {
        await SerialCodeSystem(serialInput.value);
        serialInput.value = "";
    });
}

// デバッグ用
window.iineWaruineSiteDebug =
{
    serialCode:
    {
        reset: async function(code)
        {
            if (code)
            {
                if (currentUserUid)
                {
                    const userRef = ref(db, "users/" + currentUserUid);
                    const snapshot = await get(userRef);
                    if (snapshot.exists())
                    {
                        const userData = snapshot.val();
                        if (userData.used_codes)
                        {
                            delete userData.used_codes[code];
                            await set(userRef, userData);
                        }
                    }
                }
                else
                {
                    localStorage.removeItem(`used_code_${code}`);
                }
                console.log(`シリアルコード "${code}" の使用制限をリセットしました。`);
            }
        }
    }
}