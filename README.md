# Tiệm Tai Nhỏ - Nền Tảng Đặt Lịch Vệ Sinh AirPods Tại Campus ĐH FPT
> Dự án Khởi nghiệp Đổi mới Sáng tạo môn **EXE201** | Giảng viên hướng dẫn: **Dư Tiểu Dương**

[![Deployment](https://img.shields.io/badge/Deploy-Vercel-success)](https://vercel.com)
[![Framework](https://img.shields.io/badge/React-19-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8)](https://tailwindcss.com)

---

## 🎧 1. Giới Thiệu Dự Án
**Tiệm Tai Nhỏ** là nền tảng điều phối đặt lịch trực tuyến kết hợp trạm dịch vụ bảo dưỡng, vệ sinh ngoại quan chuyên sâu và kiểm tra lỗi âm thanh cho tai nghe AirPods trực tiếp tại campus trường học.
- **Mô hình:** O2O (Online to Offline) tinh gọn.
- **Cam kết dịch vụ:** Xử lý vệ sinh ngoại quan chuyên sâu trong 30 phút giữa ca học, giá sinh viên 90.000đ. Hoàn phí 100% nếu âm lượng không cải thiện sau xử lý ngoại quan.
- **Trạm thực địa Offline:** Bàn trực tại Sảnh Tự Học Tòa Nhà A (Campus Q.9 TP.HCM) và Sảnh Beta Hall (Hòa Lạc HN).

---

## 👥 2. Thành Viên Nhóm Dự Án
| STT | Họ và Tên | MSSV | Vai trò chính |
| :---: | :--- | :---: | :--- |
| 1 | **Châu Thành Đạt** | SE180123 | Trưởng nhóm / Product Owner / Deployment Lead |
| 2 | **Trương Lâm Tấn** | SE180456 | Frontend Lead (React UI & Responsive Mobile) |
| 3 | **Nguyễn Minh Hiếu** | SE180789 | Frontend Dev / GA4 Event Tracking Specialist |
| 4 | **Nguyễn Văn Minh** | SE181122 | Backend Lead / VietQR & SePay Webhook |
| 5 | **Đoàn Minh Khôi** | SE181345 | Backend & Database Specialist (Campus & Time-Slots) |
| 6 | **Nguyễn Văn Cương** | SE181567 | QA Tester / AI Prompt Documentation Specialist |

---

## 🚀 3. Luồng Nghiệp Vụ Cốt Lõi (Core O2O Flow)
1. **Khách hàng vào Web:** Xem thông tin gói dịch vụ (Deep Cleaning 90k, Combo Làm Mới 179k).
2. **Chọn Campus & Slot:** Chọn Campus FPT, ngày và khung giờ trực trống real-time.
3. **Điền thông tin:** Tên, SĐT/Zalo, MSSV, triệu chứng lỗi tai nghe (nhỏ loa, dơ dock sạc).
4. **Xác nhận & Thanh toán:** Tự động sinh mã VietQR hoặc chọn thanh toán tiền mặt tại sảnh.
5. **Vé hẹn điện tử:** Nhận mã booking `#TTN-xxxx` và mã QR Check-in.
6. **Bàn giao tại trạm sảnh:** Kỹ thuật viên quét mã nhận máy, vệ sinh 30 phút, test âm thanh và bàn giao lại cho sinh viên.

---

## 📊 4. Đo Lường Sự Kiện Google Analytics 4 (GA4)
Hệ thống đã gắn mã đo lường GA4 (`G-TIEMTAINHO`) với 5 sự kiện chuẩn:
- `page_view` / `first_open`: Truy cập ứng dụng web.
- `view_item`: Xem bảng giá gói vệ sinh AirPods.
- `add_to_cart`: Chọn slot thời gian hẹn tại campus.
- `generate_lead` / `sign_up`: Điền form thông tin sinh viên.
- `purchase`: Xác nhận đặt lịch và kích hoạt vé hẹn điện tử.

---

## 💻 5. Cài Đặt & Chạy Thử Nghiệm

```bash
# Cài đặt thư viện
npm install

# Chạy môi trường phát triển (Localhost)
npm run dev

# Đóng gói sản phẩm (Build Production)
npm run build
```

---
*Bản quyền thuộc về Nhóm Dự án Tiệm Tai Nhỏ - EXE201.*
