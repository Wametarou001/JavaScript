export function renderTextComponent(comp) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'editor-item';

    itemDiv.innerHTML = `
        <label>項目名: <input type="text" value="${comp.label}" class="text-label-input"></label>
        <input type="text" placeholder=" (入力欄) " class="text-value-input" style="margin-left: 10px;">
    `;

    return itemDiv;
}