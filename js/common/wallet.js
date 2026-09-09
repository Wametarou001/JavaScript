import { db, auth } from "/js/common/firebase.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";

// すべての通貨の残高を取得する
export async function getAllBalances()
{
    const user = auth.currentUser;
    let balances = {};

    if (user)
    {
        const userRef = ref(db, "users/" + user.uid);
        const snapshot = await get(userRef);
        const userData = snapshot.exists() ? snapshot.val() : {};
        balances = userData.balances || { JPY: 0 };
    }
    else
    {
        // ローカルストレージの場合
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("balance_"))
            {
                const currencyCode = key.replace("balance_", "");
                balances[currencyCode] = Number(localStorage.getItem(key)) || 0;
            }
        }
        if (!balances.JPY)
        {
            balances.JPY = Number(localStorage.getItem("user_points")) || 0;
        }
    }

    // ★ここで取得時にJPYの小数をバシッと切り捨てる！
    if (balances.JPY !== undefined)
    {
        balances.JPY = Math.floor(Number(balances.JPY) || 0);
    }

    return balances;
}

// 残高を変更
export async function modifyBalance(currencyCode, amountChange)
{
    const user = auth.currentUser;

    if (user)
    {
        const userRef = ref(db, "users/" + user.uid);
        const snapshot = await get(userRef);
        const userData = snapshot.exists() ? snapshot.val() : {};

        const balances = userData.balances || {};
        const currentAmount = Number(balances[currencyCode]) || 0;
        let newAmount = Math.max(0, currentAmount + amountChange);

        // 通貨ごとの端数処理
        if (currencyCode === 'JPY')
        {
            newAmount = Math.floor(newAmount);
        }
        else
        {
            newAmount = Math.round(newAmount * 100) / 100;
        }

        balances[currencyCode] = newAmount;

        await update(userRef, { balances: balances });
        updateWalletDisplay();
        return newAmount;
    }
    else
    {
        const storageKey = `balance_${currencyCode}`;
        const currentAmount = Number(localStorage.getItem(storageKey)) || 0;
        let newAmount = Math.max(0, currentAmount + amountChange);

        if (currencyCode === 'JPY')
        {
            newAmount = Math.floor(newAmount);
            localStorage.setItem("user_points", newAmount); // 互換性のため
        }
        else
        {
            newAmount = Math.round(newAmount * 100) / 100;
        }

        localStorage.setItem(storageKey, newAmount);
        updateWalletDisplay();
        return newAmount;
    }
}

// 画面のウォレット一覧表示を更新する
export async function updateWalletDisplay() {
    const balances = await getAllBalances();

    // JPYの更新
    const jpyDisplay = document.getElementById("wallet_jpy");
    if (jpyDisplay)
    {
        jpyDisplay.textContent = balances.JPY || 0;
    }

    // USDの更新
    const usdDisplay = document.getElementById("wallet_usd");
    if (usdDisplay)
    {
        usdDisplay.textContent = balances.USD || 0;
    }

    // 既存の #user_points との同期も兼ねる場合
    const userPointsDisplay = document.getElementById("user_points");
    if (userPointsDisplay)
    {
        userPointsDisplay.textContent = balances.JPY || 0;
    }
}