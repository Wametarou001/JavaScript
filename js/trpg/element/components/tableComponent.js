export function renderTableComponent(comp) {
    // データがまだなければ初期値を用意する
    if (!comp.tableData) {
        comp.tableData = {
            columns: ["項目1", "項目2"],
            rows: [
                ["1,1", "1,2"],
                ["2,1", "2,2"]
            ]
        };
    }

    const itemDiv = document.createElement('div');
    itemDiv.className = 'editor-item';

    // 描画を更新する関数
    function updateTableHTML() {
        // ヘッダー（列名 ＋ 各列の削除ボタン）の生成
        let thHtml = comp.tableData.columns.map((col, colIndex) => `
            <th>
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px;">
                    <input type="text" value="${col}" class="col-input" data-index="${colIndex}" style="flex: 1; min-width: 0;">
                    ${comp.tableData.columns.length > 1 ? `<button type="button" class="delete-col-btn" data-index="${colIndex}" style="padding: 0 4px; font-size: 10px;" title="この列を削除">×</button>` : ''}
                </div>
            </th>
        `).join('');

        // ボディ（各行 ＋ 各行の削除ボタン）の生成
        let rowsHtml = comp.tableData.rows.map((row, rowIndex) => {
            let tds = row.map((cell, colIndex) => `
                <td><input type="text" value="${cell}" class="cell-input" data-row="${rowIndex}" data-col="${colIndex}"></td>
            `).join('');

            let actionTd = `
                <td class="col-action" style="text-align: center;">
                    ${comp.tableData.rows.length > 1 ? `<button type="button" class="delete-row-btn" data-index="${rowIndex}" style="padding: 2px 6px;" title="この行を削除">×</button>` : ''}
                </td>
            `;

            return `
                <tr>
                    ${tds}
                    ${actionTd}
                </tr>
            `;
        }).join('');

        itemDiv.innerHTML = `
            <div style="margin-bottom: 8px;">
                <label>テーブル名: <input type="text" value="${comp.label || ''}" class="component-label-input"></label>
            </div>
            <div class="component-table-wrapper">
                <table class="component-table">
                    <thead>
                        <tr>
                            ${thHtml}
                            <th class="col-action" style="width: 50px; text-align: center;">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
                <div style="margin-top: 8px;">
                    <button type="button" class="table-add-row-btn">＋ 行を追加</button>
                    <button type="button" class="table-add-col-btn">＋ 列を追加</button>
                </div>
            </div>
        `;

        bindEvents();
    }

    // イベントリスナーの割り当て
    function bindEvents() {
        // 行を追加
        itemDiv.querySelector('.table-add-row-btn').addEventListener('click', () => {
            const emptyRow = new Array(comp.tableData.columns.length).fill("");
            comp.tableData.rows.push(emptyRow);
            updateTableHTML();
        });

        // 列を追加
        itemDiv.querySelector('.table-add-col-btn').addEventListener('click', () => {
            comp.tableData.columns.push(`項目${comp.tableData.columns.length + 1}`);
            comp.tableData.rows.forEach(row => row.push(""));
            updateTableHTML();
        });

        // 各行の削除ボタン
        itemDiv.querySelectorAll('.delete-row-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (comp.tableData.rows.length <= 1) {
                    alert("これ以上行を減らせません");
                    return;
                }
                const rowIndex = parseInt(e.target.dataset.index, 10);
                comp.tableData.rows.splice(rowIndex, 1);
                updateTableHTML();
            });
        });

        // 各列の削除ボタン
        itemDiv.querySelectorAll('.delete-col-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (comp.tableData.columns.length <= 1) {
                    alert("これ以上列を減らせません");
                    return;
                }
                const colIndex = parseInt(e.target.dataset.index, 10);
                comp.tableData.columns.splice(colIndex, 1);
                comp.tableData.rows.forEach(row => row.splice(colIndex, 1));
                updateTableHTML();
            });
        });

        // 入力内容のリアルタイム同期
        itemDiv.querySelectorAll('.col-input').forEach(input => {
            input.addEventListener('input', (e) => {
                comp.tableData.columns[e.target.dataset.index] = e.target.value;
            });
        });

        itemDiv.querySelectorAll('.cell-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const r = e.target.dataset.row;
                const c = e.target.dataset.col;
                comp.tableData.rows[r][c] = e.target.value;
            });
        });

        // テーブル名の同期
        const labelInput = itemDiv.querySelector('.component-label-input');
        if (labelInput) {
            labelInput.addEventListener('input', (e) => {
                comp.label = e.target.value;
            });
        }
    }

    // 初回描画
    updateTableHTML();

    return itemDiv;
}