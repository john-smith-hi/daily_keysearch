const taskList = document.getElementById('taskList');
const addTaskBtn = document.getElementById('addTaskBtn');
const saveBtn = document.getElementById('saveBtn');
const statusDiv = document.getElementById('status');
const taskTemplate = document.getElementById('taskTemplate');

// Hàm tạo giao diện cho 1 card quản lý
function createTaskCard(label = '', url = '', keywords = '') {
    const clone = taskTemplate.content.cloneNode(true);
    const card = clone.querySelector('.task-card');

    clone.querySelector('.task-label').value = label;
    clone.querySelector('.task-url').value = url;
    clone.querySelector('.task-keywords').value = keywords;

    clone.querySelector('.delete-btn').addEventListener('click', () => {
        if (confirm('Bạn có chắc chắn muốn xóa cảnh báo này không?')) {
            card.remove();
        }
    });

    taskList.appendChild(clone);
}

// Tải dữ liệu lúc khởi động
chrome.storage.local.get(['tasks', 'url', 'keywords', 'notificationLabel'], (result) => {
    // Migration: hỗ trợ tự chuyển dữ liệu cũ thành dạng mảng
    let tasks = result.tasks;
    if (!tasks && result.url) {
        tasks = [{
            label: result.notificationLabel || '',
            url: result.url,
            keywords: result.keywords || ''
        }];
        chrome.storage.local.remove(['url', 'keywords', 'notificationLabel']);
    }

    if (tasks && tasks.length > 0) {
        tasks.forEach(t => createTaskCard(t.label, t.url, t.keywords));
    } else {
        createTaskCard(); // Mở sẵn 1 form rỗng nếu chưa có gì
    }
});

addTaskBtn.addEventListener('click', () => {
    createTaskCard();
});

saveBtn.addEventListener('click', () => {
    const cards = document.querySelectorAll('.task-card');
    const tasks = [];
    let hasError = false;

    cards.forEach(card => {
        const title = card.querySelector('.task-label').value.trim();
        const url = card.querySelector('.task-url').value.trim();
        const kws = card.querySelector('.task-keywords').value.trim();

        if (url || kws) {
            tasks.push({ label: title, url: url, keywords: kws });
            if (!url || !kws) hasError = true;
        }
    });

    if (hasError) {
        statusDiv.style.color = '#cc0000';
        statusDiv.textContent = 'Vui lòng điền đủ Đường dẫn (URL) và Từ khóa!';
        setTimeout(() => { statusDiv.textContent = ''; }, 3000);
        return;
    }

    chrome.storage.local.set({ tasks: tasks }, () => {
        statusDiv.style.color = '#0f9d58';
        statusDiv.textContent = 'Đã lưu tất cả và đang tiến hành quét lại...';

        // Gửi lệnh ép quét tới background
        chrome.runtime.sendMessage({ action: 'force_scan' });

        setTimeout(() => {
            statusDiv.textContent = '';
        }, 3000);
    });
});
