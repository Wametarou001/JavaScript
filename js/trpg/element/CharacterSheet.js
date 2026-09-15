import { renderTableComponent } from "/js/trpg/element/components/tableComponent.js";
import { renderTextComponent } from "/js/trpg/element/components/textComponent.js";

const availableComponents =
[
    // パーツはここに追加していく
    { type: 'text', name: 'テキスト入力欄', category: '基本'}, // 多分この行消す
    { type: 'table', name: 'テーブル（表）', category: '表'},
]

// 配列追加
let components = [];

const addButton = document.getElementById('add_text_button'); // 追加ボタン
const selector = document.getElementById('component_selector'); // 選択メニュー
const searchInput = document.getElementById('component_search_input'); // 検索
const componentListContainer = document.getElementById('component_list_container');

// 選択メニューのボタンを自動生成
function initComponentSelector()
{
    componentListContainer.innerHTML = '';

    availableComponents.forEach(function(compDef)
    {
        const button = document.createElement('button');
        button.className = 'select_item_button search_target';
        button.setAttribute('data-type', compDef.type);
        button.setAttribute('data-name', compDef.name);
        button.textContent = compDef.name; // ボタンに表示される名前

        // 動的に作ったボタンにクリックイベントを登録
        button.addEventListener('click', function()
        {
            const type = this.getAttribute('data-type');

            // 新しいパーツのデータを作成
            const newComponent =
            {
                id: 'component_' + Date.now(),
                type: type,
                label: '新しい項目'
            };

            // 再描画
            components.push(newComponent);
            renderCanvas();

            // メニューを閉じる
            selector.style.display = 'none';

            if (searchInput)
            {
                searchInput.value = '';
                document.querySelectorAll('.search_target').forEach(i => i.style.display = 'inline-block');
            }
        });

        // コンテナの中にボタンを追加する
        componentListContainer.appendChild(button);
    });
}

// 起動時にボタンを生成する
initComponentSelector();

// 追加ボタンクリック時のイベント
addButton.addEventListener('click', function()
{
    // ボタンが表示されていれば隠す、隠れていれば表示
    if (selector.style.display === 'none')
    {
        selector.style.display = 'block';
        if (searchInput) searchInput.focus();
    }
    else
    {
        selector.style.display ='none';
    }
});

// 検索窓の絞り込み
if (searchInput)
{
    searchInput.addEventListener('input', function()
    {
        const keyword = this.value.toLowerCase(); // 入力された文字
        const items = document.querySelectorAll('.search_target');

        items.forEach(function(item)
        {
            const name = item.getAttribute('data-name').toLowerCase();

            // キーワードが含まれているか
            if (name.includes(keyword))
            {
                item.style.display = 'inline-block'; // 一致で表示
            }
            else
            {
                item.style.display ='none'; // 非一致で非表示
            }
        });
    });
}

// 画面を再描画させる関数
function renderCanvas()
{
    const canvas = document.getElementById('canvas');
    canvas.innerHTML = '';

    if (components.length === 0)
    {
        canvas.innerHTML = '<p style="color: #888;">パーツ追加欄</p>';
        return;
    }

    components.forEach(function(comp)
    {
        let componentElement = null;

        // 種類によって、対応するファイル（関数）を呼び出すだけ！
        if (comp.type === 'text')
        {
            componentElement = renderTextComponent(comp);
        }
        else if (comp.type === 'table')
        {
            componentElement = renderTableComponent(comp);
        }

        if (componentElement)
        {
            canvas.appendChild(componentElement);
        }
    });
}