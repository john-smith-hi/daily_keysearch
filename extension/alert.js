// Lấy thông tin từ query parameters (được truyền vào từ background.js)
const urlParams = new window.URLSearchParams(window.location.search);
const label = urlParams.get('label') || 'Thông báo';
const keyword = urlParams.get('kw') || 'N/A';
const targetUrl = urlParams.get('target') || '#';
const errorMsg = urlParams.get('errorMsg');

// Căn giữa cửa sổ tự động
chrome.windows.getCurrent((win) => {
    const left = Math.round((window.screen.availWidth - win.width) / 2);
    const top = Math.round((window.screen.availHeight - win.height) / 2);
    chrome.windows.update(win.id, { left: left, top: top });
});

// Gắn giao diện
document.getElementById('alertLabel').textContent = label;

if (errorMsg) {
    document.getElementById('msgPrefix').innerHTML = `<strong style="color:#cc0000;">${errorMsg}</strong>`;
} else {
    document.getElementById('matchedKeyword').textContent = keyword;
}

const targetLink = document.getElementById('targetLink');
targetLink.href = targetUrl;
targetLink.textContent = targetUrl;
