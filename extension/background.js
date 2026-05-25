// Sự kiện chạy khi Extension vừa được load hoặc lúc trình duyệt mới khởi động
chrome.runtime.onStartup.addListener(() => runCheck());
chrome.runtime.onInstalled.addListener(() => runCheck());

// Bắt sự kiện khi người dùng mở cửa sổ trình duyệt mới
chrome.windows.onCreated.addListener((window) => {
    if (window && window.type === 'normal') {
        runCheck();
    }
});

// Lắng nghe lệnh khởi chạy ép buộc (khi lưu)
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'force_scan') {
        runCheck(true);
    }
});

// Sự kiện click chuột trái vào biểu tượng Extension
chrome.action.onClicked.addListener(() => {
    chrome.runtime.openOptionsPage();
});

// Hẹn giờ check định kỳ (60 phút 1 lần)
chrome.alarms.create("dailyCheck", { periodInMinutes: 60 });
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "dailyCheck") {
        runCheck();
    }
});

function getTodayDateString() {
    const d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}

let isRunning = false;

async function runCheck(force = false) {
    if (isRunning) return;
    isRunning = true;

    const today = getTodayDateString();

    chrome.storage.local.get(['lastRunDate', 'tasks'], async (result) => {
        const tasks = result.tasks || [];

        // Nếu chưa cấu hình bất kỳ task nào
        if (tasks.length === 0) {
            console.log('Chưa cấu hình Cảnh báo nào. Mở Options.');
            chrome.runtime.openOptionsPage();
            isRunning = false;
            return;
        }

        // Nếu hôm nay đã quét toàn bộ tasks và không có lệnh quét ép buộc
        if (!force && result.lastRunDate === today) {
            console.log('Hôm nay đã xử lý toàn bộ danh sách tìm kiếm. Bỏ qua.');
            isRunning = false;
            return;
        }

        // Lặp qua tất cả cấu hình để tiến hành fetch và kiểm tra
        for (const task of tasks) {
            if (!task.url || !task.keywords) continue;

            try {
                const response = await fetch(task.url);

                // Kiểm tra có bị chuyển hướng trái phép không (sai link URL)
                let reqUrl = new URL(task.url).href.replace(/\/$/, '');
                let resUrl = new URL(response.url).href.replace(/\/$/, '');
                if (reqUrl !== resUrl) {
                    throw new Error(`Đường link đã bị chuyển hướng (từ ${reqUrl} sang ${resUrl}). Rất có thể link ban đầu nhập bị sai hoặc không còn tồn tại!`);
                }

                if (!response.ok) {
                    throw new Error(`Mã lỗi HTTP ${response.status}`);
                }
                const html = await response.text();

                // Lọc bỏ script, style và các tag html để lấy nội dung text
                const cleanText = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                    .replace(/<[^>]+>/g, ' ');

                if (cleanText.trim() === '') {
                    throw new Error('Trang web trả về kết quả rỗng, không chứa văn bản nào');
                }

                const cleanTextLower = cleanText.toLowerCase();
                const keywordArray = task.keywords.split(',').map(k => k.trim()).filter(k => k);

                let isMatched = false;
                let matchedKeyword = '';

                // Quét không phân biệt hoa/thường
                for (const kw of keywordArray) {
                    if (cleanTextLower.includes(kw.toLowerCase())) {
                        isMatched = true;
                        matchedKeyword = kw;
                        break;
                    }
                }

                if (isMatched) {
                    const label = task.label || 'Phát hiện từ khóa!';

                    // Tạo cửa sổ Popup cảnh báo
                    const urlObj = new URL(chrome.runtime.getURL('alert.html'));
                    urlObj.searchParams.append('label', label);
                    urlObj.searchParams.append('kw', matchedKeyword);
                    urlObj.searchParams.append('target', task.url);

                    chrome.windows.create({
                        url: urlObj.href,
                        type: 'popup',
                        width: 700,
                        height: 700,
                        focused: true
                    });
                }
            } catch (error) {
                console.error(`Lỗi khi fetch dữ liệu tại URL ${task.url}:`, error);

                // Mở popup thông báo lỗi đường dẫn
                const urlObj = new URL(chrome.runtime.getURL('alert.html'));
                urlObj.searchParams.append('label', '⚠️ Lỗi cài đặt!');
                urlObj.searchParams.append('errorMsg', `Không thể truy xuất nội dung từ đường dẫn này. Xin vui lòng kiểm tra lại link URL (Chi tiết lỗi: ${error.message}).`);
                urlObj.searchParams.append('target', task.url);

                chrome.windows.create({
                    url: urlObj.href,
                    type: 'popup',
                    width: 700,
                    height: 700,
                    focused: true
                });
            }
        }

        // Đánh dấu mốc thời gian hoàn tất kiểm tra
        chrome.storage.local.set({ lastRunDate: today }, () => {
            isRunning = false;
        });
    });
}

// Chạy trực tiếp mỗi lần Background Service đánh thức
runCheck();
