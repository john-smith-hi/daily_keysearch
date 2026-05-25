# Tiện ích Quét và Cảnh báo Từ khóa trên Trang web

Đây là tiện ích mở rộng trên Chrome (Chrome Extension) chạy ngầm, tự động lấy dữ liệu từ một trang web mỗi ngày 1 lần. Nếu tìm thấy dữ liệu khớp với từ khóa cung cấp, một cửa sổ cảnh báo nổi (Mid-screen popup) sẽ được hiển thị để nhắc nhở.

## Hướng dẫn cài đặt

1. Mở trình duyệt Chrome.
2. Truy cập vào đường dẫn: `chrome://extensions/`
3. Bật **Chế độ dành cho nhà phát triển** (Developer mode) ở góc phải phía trên.
4. Nhấn vào nút **Tải tiện ích đã giải nén** (Load unpacked) ở góc trái phía trên.
5. Chọn thư mục chứa các file của extension này (thư mục `extension`).

## Hướng dẫn sử dụng và Cấu hình

- Mặc định sau khi cài đặt, bạn cần tự điền **Đường dẫn trang web** và danh sách **Từ khóa** (cách nhau bởi dấu phẩy).
- Tiện ích tự động chạy khi bạn mở trình duyệt. Nếu trúng từ khóa trong trang đích, cửa sổ dạng popup sẽ nhảy ra ở giữa màn hình.
- Để tùy chỉnh cấu hình: Click chuột trái vào biểu tượng Extension ở thanh công cụ Chrome -> Tùy chọn (Options).
- Trong tùy chọn, bạn có thể thay đổi: **Đường dẫn trang web** và danh sách **Từ khóa** (cách nhau bởi dấu phẩy).

## Hướng dẫn chạy lại / Test lại trong ngày

Chương trình được thiết kế chỉ quét dữ liệu **đúng 1 lần trong 1 ngày** và lưu lại cờ xác nhận trên bộ nhớ nội bộ của Extension.
Nếu bạn đang Dev hoặc muốn kiểm tra nhiều lần, cần làm theo cách sau để xoá lịch sử lưu để chương trình chạy lại:

1. Mở trang cài đặt tiện ích: `chrome://extensions/`
2. Tìm đến ứng dụng *Keyword Alert Extension*.
3. Click vào **"Inspect views: service worker"** (Kiểm tra: Trình chạy dịch vụ). Màn hình F12 Developer Tools sẽ mở ra.
4. Chuyển sang Tab **Console**, dán lệnh sau và nhấn Enter:
   ```javascript
   chrome.storage.local.clear()
   ```
5. Sau khi xoá thành công, bạn có thể click vào icon vòng tròn **Reload** ở ngay khung mô tả tiện ích để ép tiện ích khởi động lại và hiện cảnh báo (nếu có keyword trên web).
