const mainPageButton = document.getElementById('main_button');

mainPageButton.addEventListener
(
    'click', () =>
    {
        window.location.href = './index.html';
    }
);

// シリアルコード認証
const serialCodes =
{
    "超良いね！": 1000,
};

function SerialCodeSystem(code)
{
    const trimmedCode = code.trim();

    if (!serialCodes.hasOwnProperty(trimmedCode))
    {
        alert("無効なシリアルコードです。");
        return;
    }

    // 使用済みコードを保存
    const storageKey = `used_code_${trimmedCode}`;
    if (localStorage.getItem(storageKey) === "true")
    {
        alert("このシリアルコードはすでに使用済みです。");
        return;
    }

    const reward = serialCodes[trimmedCode];
    const rewardAmount = typeof reward === 'string' ? math.evaluate(reward) : reward;

    const currentPoints = Number(localStorage.getItem("user_points")) || 0; // 現在のポイント数
    const newPoints = currentPoints + rewardAmount;

    localStorage.setItem("user_points", newPoints);
    localStorage.setItem(storageKey, "true");

    if (typeof updatePointDisplay === 'function')
    {
        updatePointDisplay();
    }

    alert(`シリアルコードを入力しました。 ${rewardAmount}pt を獲得しました。`);
}

const serialInput = document.getElementById("serial_input");
const serialButton = document.getElementById("serial_button");

if (serialButton && serialInput)
{
    serialButton.addEventListener("click", () =>
    {
        SerialCodeSystem(serialInput.value);
        serialInput.value = "";
    });
}

// デバッグ用
window.iineWaruineSiteDebug =
{
    serialCode:
    {
        reset: function(code)
        {
            if (code)
            {
                localStorage.removeItem(`used_code_${code}`);
                console.log(`シリアルコード "${code}" の使用制限をリセットしました。`);
            }
        }
    }
}

