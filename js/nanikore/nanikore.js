const backButton = document.getElementById('back_button');

backButton.addEventListener('click', () =>
{
    window.location.href = '/index.html';
});

const inputField = document.getElementById('crazy_input');
const goButton = document.getElementById('go_button');
const outputArea = document.getElementById('output_area');

// キーワード設定
const customRules = [
    // { word: "", value: 1, type: "+", label: "" },
    { word: "test", value: 1.1, type: "*", label: "テスト検証してくれてありがとう" },
    { word: "プラス", value: 3000, type: "+", label: "増加" },
    { word: "マイナス", value: -3000, type: "+", label: "" },
    { word: "良いね", value: 5.0, type: "*", label: "" },
    { word: "悪いね", value: 0.01, type: "*", label: "" },
    { word: "大凶", value: -100000, type: "+", label: "悪いね！！！！！" },
    { word: "大吉", value: 10000, type: "+", label: "良いね！！！！！" },
    { word: "名乗れよ", value: -1.8, type: "*", label: "お前が名乗れ" },
];

function addText()
{
    const text = inputField.value.trim();

    if(text === "") return;

    // 前の結果を消去
    outputArea.innerHTML = "";

    let addReasons = [];
    let addScore = 0;
    let achievedCount = 0; // 条件達成数のカウント用

    // 文字数ボーナス (x * 100)
    let charCount = text.length;
    let charBonus = charCount * 100;
    addScore += charBonus;
    addReasons.push(`文字数(${charCount}文字)：+${charBonus}`);
    achievedCount++;

    // 漢字ボーナス (x * 250)
    let kanjiMatches = text.match(/[\u4e00-\u9faf]/g);
    let kanjiCount = kanjiMatches ? kanjiMatches.length : 0;
    if (kanjiCount > 0)
    {
        let kanjiBonus = kanjiCount * 250;
        addScore += kanjiBonus;
        addReasons.push(`漢字(${kanjiCount}文字)：+${kanjiBonus}`);
        achievedCount++;
    }

    // 記号を使っている (x * 30)
    let symbolMatches = text.match(/[！-／：-＠［-｀\{-\~、-。「」]/g);
    let symbolCount = symbolMatches ? symbolMatches.length : 0;
    if (symbolCount > 0)
    {
        let symbolBonus = symbolCount * 30;
        addScore += symbolBonus;
        addReasons.push(`記号(${symbolCount}文字)：+${symbolBonus}`);
        achievedCount++;
    }

    // 数字を使っている (x * 50)
    let numberMatches = text.match(/[0-9０-９]/g);
    let numberCount = numberMatches ? numberMatches.length : 0;
    if (numberCount > 0)
    {
        let numberBonus = numberCount * 50;
        addScore += numberBonus;
        addReasons.push(`数字(${numberCount}文字)：+${numberBonus}`);
        achievedCount++;
    }

    // 同じ文字の最発現回数チェック（3字、5字、10字、20字、全部）
    let charCounts = {};
    for (let char of text) {
        charCounts[char] = (charCounts[char] || 0) + 1;
    }
    let maxSameCharCount = Math.max(...Object.values(charCounts));

    if (maxSameCharCount >= 3)
    {
        addScore += 500;
        addReasons.push(`最多文字3字以上(${maxSameCharCount}回)：+500`);
        achievedCount++;
    }
    if (maxSameCharCount >= 5)
    {
        addScore += 1000;
        addReasons.push(`最多文字5字以上(${maxSameCharCount}回)：+1000`);
        achievedCount++;
    }
    if (maxSameCharCount >= 10)
    {
        addScore += 10000;
        addReasons.push(`最多文字10字以上(${maxSameCharCount}回)：+10000`);
        achievedCount++;
    }
    if (maxSameCharCount >= 20)
    {
        addScore += 50000;
        addReasons.push(`最多文字20字(${maxSameCharCount}回)：+50000`);
        achievedCount++;
    }
    if (text.length > 0 && maxSameCharCount === text.length)
    {
        addScore += 30000;
        addReasons.push(`全部同じ文字：+30000`);
        achievedCount++;
    }

    // 特定キーワードの加算判定（type === "+"）（出現回数対応）
    customRules.forEach(rule => {
        if (!rule.word) return;
        let escapedWord = rule.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        let matches = text.match(new RegExp(escapedWord, 'g'));
        let count = matches ? matches.length : 0;

        if (count > 0 && rule.type === "+")
        {
            let totalValue = rule.value * count;
            addScore += totalValue;
            let prefix = totalValue >= 0 ? "+" : "";
            let displayName = rule.label ? `${rule.label}(${rule.word})` : rule.word;
            let countText = count > 1 ? `(${count}回)` : "";

            addReasons.push(`${displayName}${countText}：${prefix}${totalValue}`);
            achievedCount += count; // 出現回数分だけ達成数も加算！
        }
    });


    // --- 乗算グループ ---
    let mulReasons = [];
    let totalMultiplier = 1.0;

    // スペースが含まれている：1個につき ×0.9
    let spaceMatches = text.match(/\s/g);
    let spaceCount = spaceMatches ? spaceMatches.length : 0;
    if (spaceCount > 0)
    {
        for (let i = 0; i < spaceCount; i++)
        {
            totalMultiplier = math.multiply(totalMultiplier, 0.9);
        }
        mulReasons.push(`スペース(${spaceCount}個)：${Math.pow(0.9, spaceCount).toFixed(1)}x`);
        achievedCount++;
    }

    // ひらがなのみ：3.0x
    let isOnlyHiragana = /^[\u3040-\u309f]+$/.test(text);
    if (isOnlyHiragana)
    {
        totalMultiplier = math.multiply(totalMultiplier, 3.0);
        mulReasons.push(`ひらがなのみ：3.0x`);
        achievedCount++;
    }

    // カタカナのみ：0.01x
    let isOnlyKatakana = /^[\u30a0-\u30ff\uff66-\uff9f]+$/.test(text);
    if (isOnlyKatakana)
    {
        totalMultiplier = math.multiply(totalMultiplier, 0.01);
        mulReasons.push(`カタカナのみ：0.01x`);
        achievedCount++;
    }

    // 英語（アルファベット）のみ：-1.0x
    let isOnlyEnglish = /^[a-zA-Z]+$/.test(text);
    if (isOnlyEnglish)
    {
        totalMultiplier = math.multiply(totalMultiplier, -1.0);
        mulReasons.push(`英語のみ：-1.0x`);
        achievedCount++;
    }

    // 感嘆符「!」「！」：1個につき -1.0x（反転）
    let exclamationMatches = text.match(/[!！]/g);
    let exclamationCount = exclamationMatches ? exclamationMatches.length : 0;
    if (exclamationCount > 0)
    {
        for (let i = 0; i < exclamationCount; i++)
        {
            totalMultiplier = math.multiply(totalMultiplier, -1.0);
        }
        let finalExclamationMul = Math.pow(-1, exclamationCount);
        mulReasons.push(`否定演算子「!」(${exclamationCount}個)：${finalExclamationMul}.0x`);
        achievedCount++;
    }

    // しりとり負け（末尾が「ん」または「ン」）
    let lastChar = text.slice(-1);
    if (lastChar === "ん" || lastChar === "ン")
    {
        totalMultiplier = math.multiply(totalMultiplier, 0.1);
        mulReasons.push(`しりとりだったら負けてる：0.1x`);
        achievedCount++;
    }

    // 「TRPG」または「1d100」が含まれている場合：-100.0x 〜 100.0x のランダム倍率
    let trpgRegex = /trpg|1d100/i;
    if (trpgRegex.test(text))
    {
        // -100.0 から 100.0 までの間のランダムな値を小数点1桁までで生成
        let randomMul = Math.floor((Math.random() * 200 - 100) * 10) / 10;
        totalMultiplier = math.multiply(totalMultiplier, randomMul);
        mulReasons.push(`1D100(-100.0x~100.0x)：${randomMul}x`);
        achievedCount++;
    }

    // 特定キーワードの乗算判定（type === "*"）（出現回数対応）
    customRules.forEach(rule => {
        if (!rule.word) return;
        let escapedWord = rule.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        let matches = text.match(new RegExp(escapedWord, 'g'));
        let count = matches ? matches.length : 0;

        if (count > 0 && rule.type === "*")
        {
            let finalRuleMul = 1.0;
            for (let i = 0; i < count; i++)
            {
                totalMultiplier = math.multiply(totalMultiplier, rule.value);
                finalRuleMul *= rule.value;
            }
            let displayName = rule.label ? `${rule.label}(${rule.word})` : rule.word;
            let countText = count > 1 ? `(${count}回)` : "";

            mulReasons.push(`${displayName}${countText}：${finalRuleMul.toFixed(2)}x`);
            achievedCount += count; // 出現回数分だけ達成数も乗算側で加算！
        }
    });

    // 条件達成数に応じた累乗倍率（初期1.0、1個につき+0.1）
    let conditionMultiplier = 1.0 + (achievedCount * 0.1);

    // 最終計算
    let baseCalculation = math.evaluate(`(${addScore}) * (${totalMultiplier})`);

    let finalScore;
    if (baseCalculation < 0) {
        finalScore = -Math.floor(Math.pow(Math.abs(baseCalculation), conditionMultiplier));
    } else {
        finalScore = Math.floor(math.pow(baseCalculation, conditionMultiplier));
    }

    // 画面に表示する要素を作る
    const newItem = document.createElement('div');

    let htmlContent = `「${text}」<br><br>`;

    // 加算項目の結合
    if (addReasons.length > 0) {
        htmlContent += addReasons.join('<br>') + '<br>';
    }

    // 一行開ける
    htmlContent += '<br>';

    // 乗算項目の結合（もしあれば）
    if (mulReasons.length > 0) {
        htmlContent += mulReasons.join('<br>') + '<br>';
    }

    // 一行開けて条件達成数と最終スコア
    htmlContent += `<br>条件達成(${achievedCount}個)：${conditionMultiplier.toFixed(1)}乗<br>`;
    htmlContent += `${text}のスコア：${finalScore.toLocaleString()}点`;

    newItem.innerHTML = htmlContent;
    outputArea.appendChild(newItem);

    inputField.value = "";
    inputField.focus();
}

// イベント設定
goButton.addEventListener('click', addText);
inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        addText();
    }
});