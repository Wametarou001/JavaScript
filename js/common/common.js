document.addEventListener(
    'DOMContentLoaded', () =>
    {
        const basePath = '/components/';

        // ヘッダーの読み込み
        fetch(basePath + 'header.html')
        .then
        (
            response =>
            {
                if (!response.ok) throw new Error('ヘッダーの読み込みに失敗しました');
                return response.text();
            }
        )
        .then
        (
            data =>
            {
                const headerContainer = document.getElementById('header_container');
                if (headerContainer)
                {
                    headerContainer.innerHTML = data;

                    const homeLinks = headerContainer.querySelectorAll('[data-link="home"]');
                    const nextLinks = headerContainer.querySelectorAll('[data-link="next"]');
                    const bakaLinks = headerContainer.querySelectorAll('[data-link="baka"]');

                    // ▼ ここを /html/ を抜いたパスに修正
                    homeLinks.forEach(el => el.setAttribute('href', '/index.html'));
                    nextLinks.forEach(el => el.setAttribute('href', '/next.html'));
                    bakaLinks.forEach(el => el.setAttribute('href', '/baka.html'));
                }
            }
        )
        .catch(error => console.error(error));

        // フッターの読み込み
        fetch(basePath + 'footer.html')
        .then
        (
            response =>
            {
                if (!response.ok) throw new Error('フッターの読み込みに失敗しました');
            return response.text();
            }
        )
        .then
        (
            data =>
            {
                const footerContainer = document.getElementById('footer-container');
                if (footerContainer)
                {
                    footerContainer.innerHTML = data;
                }
            }
        )
        .catch(error => console.error(error));
    }
);