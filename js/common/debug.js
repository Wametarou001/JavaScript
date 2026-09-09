import { modifyBalance, getAllBalances } from '/js/common/wallet.js';
import { db, auth } from "/js/common/firebase.js";
import { ref, update } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";

export function initDebug(auth)
{
    window.iineWaruineSiteDebug =
    {
        // おみくじ制限リセット
        omikuji:
        {
            reset: async function()
            {
                const user = auth.currentUser;
                if (user)
                {
                    const userRef = ref(db, "users/" + user.uid);
                    await update(userRef, {
                        last_omikuji_date: null,
                        last_omikuji_result: null
                    });
                    console.log("Firebaseのおみくじ制限をリセットしました。ページを再読み込みしてください。");
                }
                else
                {
                    localStorage.removeItem("last_omikuji_date");
                    localStorage.removeItem("last_omikuji_result");
                    console.log("ローカルのおみくじ制限をリセットしました。ページを再読み込みしてください。");
                }
            }
        },

        // ウォレット（各通貨）操作
        wallet:
        {
            add: async function(currencyCode, amount)
            {
                const evaluatedAmount = typeof amount === 'string' ? math.evaluate(amount) : amount;
                const newAmount = await modifyBalance(currencyCode, evaluatedAmount);

                // JPYの場合は画面のポイント表示も更新を試みる
                if (currencyCode === 'JPY')
                {
                    const pointDisplay = document.getElementById("user_points");
                    if (pointDisplay)
                    {
                        pointDisplay.textContent = newAmount;
                    }
                }

                console.log(`${evaluatedAmount} ${currencyCode} を追加しました。（残高: ${newAmount} ${currencyCode}）`);
            },
            set: async function(currencyCode, amount)
            {
                const evaluatedAmount = typeof amount === 'string' ? math.evaluate(amount) : amount;

                // 現在の残高との差分を計算してmodifyBalanceに渡すことで、安全に値を上書き設定する
                const balances = await getAllBalances();
                const currentAmount = Number(balances[currencyCode]) || 0;
                const diff = evaluatedAmount - currentAmount;

                const newAmount = await modifyBalance(currencyCode, diff);

                if (currencyCode === 'JPY')
                {
                    const pointDisplay = document.getElementById("user_points");
                    if (pointDisplay)
                    {
                        pointDisplay.textContent = newAmount;
                    }
                }

                console.log(`${currencyCode} の残高を ${newAmount} に設定しました。`);
            }
        },

        // アカウント操作
        account:
        {
            logout: function()
            {
                auth.signOut().then(() => {
                    console.log("ログアウトしました。");
                    location.reload();
                });
            }
        }
    };
}