document.addEventListener('DOMContentLoaded', () => {
    // どのページから呼ばれても components は2つ上にある
    const basePath = '../../components/';

    // ヘッダーの読み込み
    fetch(basePath + 'header.html')
        .then(response => {
            if (!response.ok) throw new Error('ヘッダーの読み込みに失敗しました');
            return response.text();
        })
        .then(data => {
            const headerContainer = document.getElementById('header_container');
            if (headerContainer) {
                headerContainer.innerHTML = data;

                // リンク先の自動調整（すべてルート階層なので "./" でOK）
                const homeLinks = headerContainer.querySelectorAll('[data-link="home"]');
                const nextLinks = headerContainer.querySelectorAll('[data-link="next"]');

                homeLinks.forEach(el => el.setAttribute('href', './index.html'));
                nextLinks.forEach(el => el.setAttribute('href', './next.html'));
            }
        })
        .catch(error => console.error(error));

    // フッターの読み込み
    fetch(basePath + 'footer.html')
        .then(response => {
            if (!response.ok) throw new Error('フッターの読み込みに失敗しました');
            return response.text();
        })
        .then(data => {
            const footerContainer = document.getElementById('footer-container');
            if (footerContainer) {
                footerContainer.innerHTML = data;
            }
        })
        .catch(error => console.error(error));
});