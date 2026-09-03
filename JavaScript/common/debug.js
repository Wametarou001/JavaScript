export function initDebug(auth, updatePointDisplay) {
    window.iineWaruineSiteDebug = {
        // おみくじ制限リセット
        omikuji: {
            reset: function() {
                localStorage.removeItem("last_omikuji_date");
                localStorage.removeItem("last_omikuji_result");
                console.log("おみくじの制限をリセットしました。ページを再読み込みしてください。");
            }
        },

        // ポイント操作
        points: {
            add: function(amount) {
                const evaluatedAmount = typeof amount === 'string' ? math.evaluate(amount) : amount;
                const currentPoints = Number(localStorage.getItem("user_points")) || 0;
                const newPoints = currentPoints + evaluatedAmount;
                localStorage.setItem("user_points", newPoints);
                if (typeof updatePointDisplay === 'function') updatePointDisplay();
                console.log(`${evaluatedAmount}ptを追加しました。（合計: ${newPoints}pt）`);
            },
            set: function(amount) {
                const evaluatedAmount = typeof amount === 'string' ? math.evaluate(amount) : amount;
                localStorage.setItem("user_points", evaluatedAmount);
                if (typeof updatePointDisplay === 'function') updatePointDisplay();
                console.log(`ポイントを ${evaluatedAmount}pt に設定しました。`);
            }
        },

        // アカウント操作
        account: {
            logout: function() {
                auth.signOut().then(() => {
                    console.log("ログアウトしました。");
                    location.reload();
                });
            }
        }
    };
}