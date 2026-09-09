import { modifyBalance, getAllBalances } from '/js/common/wallet.js';

// キー設定
const CACHE_KEY = 'exchange_rates';
const TIME_KEY = 'exchange_timestamp';
const ONE_HOUR = 60 * 60 * 1000;

export function initCurrentExchange()
{
    const fromCurrency = document.getElementById('from_currency');
    const toCurrency = document.getElementById('to_currency');
    const exchangeAmount = document.getElementById('exchange_amount');
    const resultAmount = document.getElementById('result_amount');
    const resultUnit = document.getElementById('result_unit');
    const exchangeButton = document.getElementById('exchange_button');

    // 為替レートを取得する
    async function getRates()
    {
        const savedRates = localStorage.getItem(CACHE_KEY);
        const savedTime = localStorage.getItem(TIME_KEY);
        const now = new Date().getTime();

        // 一時間以内のキャッシュがあればそれを使用
        if (savedRates && savedTime && (now - savedTime < ONE_HOUR))
        {
            return JSON.parse(savedRates);
        }

        try
        {
            // 為替API
            const response = await fetch('https://open.er-api.com/v6/latest/JPY');
            const data = await response.json();
            const rates = data.rates;

            localStorage.setItem(CACHE_KEY, JSON.stringify(rates));
            localStorage.setItem(TIME_KEY, now);
            return rates;
        }
        catch (error)
        {
            console.error('為替レート取得失敗：', error);
            return savedRates ? JSON.parse(savedRates) : { USD: 0.0066 };
        }
    }

    // 換算計算と表示を更新する関数
    async function updateCalculation()
    {
        const amount = parseFloat(exchangeAmount.value) || 0;
        const from = fromCurrency.value;
        const to = toCurrency.value;

        const rates = await getRates();

        const getRateAgainstJpy = (currency) =>
        {
            if (currency === 'JPY') return 1;
            return rates[currency] || 1;
        };

        const rateFrom = getRateAgainstJpy(from);
        const rateTo = getRateAgainstJpy(to);

        const amountInJpy = amount / rateFrom; // 通貨を日本円に変換
        const converted = amountInJpy * rateTo; // 日本円から指定の通貨に変換

        // 小数点第2位まで表示
        resultAmount.textContent = converted.toFixed(2);
    }

    // 変換先が変わったとき再計算
    toCurrency.addEventListener('change', (e) =>
    {
        if (e.target.value === 'USD')
        {
            resultUnit.textContent = '$';
        }
        else if (e.target.value === 'JPY')
        {
            resultUnit.textContent = '円';
        }
        updateCalculation();
    });

    exchangeAmount.addEventListener('input', updateCalculation);
    fromCurrency.addEventListener('change', updateCalculation);

    // 変換ボタンを押したときの処理（wallet.jsの共通関数を呼び出し）
    if (exchangeButton) {
        exchangeButton.addEventListener('click', async () => {
            const amount = parseFloat(exchangeAmount.value) || 0;
            const from = fromCurrency.value;
            const to = toCurrency.value;

            if (amount <= 0) {
                alert("有効な金額を入力してください。");
                return;
            }

            // --- 所持金の残高チェックを追加 ---
            const balances = await getAllBalances();
            const currentBalance = balances[from] || 0;

            if (currentBalance < amount) {
                alert(`${from}の残高が足りません。現実を見ましょう。`);
                return;
            }
            // ----------------------------------------

            const rates = await getRates();
            const getRateAgainstJpy = (currency) => (currency === 'JPY' ? 1 : rates[currency] || 1);

            const amountInJpy = amount / getRateAgainstJpy(from);
            const convertedAmount = amountInJpy * getRateAgainstJpy(to);

            // 変換先がJPYの場合は小数点以下を切り捨て、USDの場合は小数点第2位までにする
            let finalConvertedAmount;
            if (to === 'JPY') {
                finalConvertedAmount = Math.floor(convertedAmount);
            } else {
                finalConvertedAmount = parseFloat(convertedAmount.toFixed(2));
            }

            // 1. 元通貨を減らす
            await modifyBalance(from, -amount);
            // 2. 変換先の通貨を増やす
            await modifyBalance(to, finalConvertedAmount);

            alert(`${amount} ${from} を ${finalConvertedAmount} ${to} に両替しました。`);
            updateCalculation();
        });
    }

    // 初期化
    updateCalculation();
}