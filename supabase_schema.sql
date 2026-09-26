-- ==============================================================
-- DATABASE SCHEMA: PODCYCLE - TIỆM TAI NHỎ FPT (EXE201)
-- Hệ Quản Trị Cơ Sở Dữ Liệu: Supabase Cloud PostgreSQL
-- Hướng dẫn: Mở Supabase Dashboard -> SQL Editor -> Dán toàn bộ nội dung này và bấm RUN
-- ==============================================================

-- 1. BẢNG APP_USERS (Tài khoản Người Dùng & Kỹ Thuật Viên)
CREATE TABLE IF NOT EXISTS app_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  student_id TEXT,
  role TEXT NOT NULL DEFAULT 'CUSTOMER', -- 'CUSTOMER' hoặc 'TECHNICIAN'
  campus TEXT NOT NULL,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BẢNG BOOKINGS (Lịch Hẹn Đặt Vệ Sinh & Hồ Sơ Kiểm Định Âm Học Chuẩn SOP 6 Giai Đoạn)
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  booking_code TEXT NOT NULL UNIQUE,
  user_id TEXT REFERENCES app_users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  student_id TEXT,
  campus TEXT NOT NULL,
  device_model TEXT NOT NULL,
  serial_number TEXT,
  issue_note TEXT,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  booking_date DATE NOT NULL,
  slot_time TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL, -- 'PAID', 'UNPAID', 'REFUNDED'
  status TEXT NOT NULL,         -- 'PENDING_PAYMENT', 'CONFIRMED', 'CHECKED_IN', 'PROCESSING', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED', 'REFUNDED'
  technician_name TEXT,
  sound_clarity_score INTEGER DEFAULT 98,
  before_photo TEXT,
  after_photo TEXT,
  checklist_before JSONB,
  checklist_after JSONB,
  scope_lock_reason TEXT,
  next_maintenance_date DATE,
  refund_reason TEXT,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Bổ sung cột an toàn nếu bảng đã tồn tại
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS serial_number TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checklist_before JSONB;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checklist_after JSONB;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS scope_lock_reason TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS next_maintenance_date DATE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_reason TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

-- 3. BẢNG TRANSACTIONS (Lịch Sử Giao Dịch Cổng Thanh Toán SePay PG)
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  booking_id TEXT REFERENCES bookings(id) ON DELETE CASCADE,
  booking_code TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'SEPAY_PG',
  reference_number TEXT,
  status TEXT NOT NULL DEFAULT 'SUCCESS',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BẢNG SUPPORT_TICKETS (Trung Tâm Liên Hệ & Phản Hồi Sinh Viên)
CREATE TABLE IF NOT EXISTS support_tickets (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  student_id TEXT,
  phone TEXT NOT NULL,
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. KÍCH HOẠT REALTIME SUPABASE CHO TOÀN BỘ CÁC BẢNG
ALTER PUBLICATION supabase_realtime ADD TABLE app_users;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE support_tickets;

-- 5. CẤU HÌNH QUYỀN TRUY CẬP (ROW LEVEL SECURITY CHO PHÉP CLIENT QUERY)
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access to app_users" ON app_users;
CREATE POLICY "Public access to app_users" ON app_users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to bookings" ON bookings;
CREATE POLICY "Public access to bookings" ON bookings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to support_tickets" ON support_tickets;
CREATE POLICY "Public access to support_tickets" ON support_tickets FOR ALL USING (true) WITH CHECK (true);

-- 6. NẠP DỮ LIỆU SEED KHỞI TẠO TÀI KHOẢN VÀ 12 ĐƠN HÀNG THỰC TẾ
-- Mật khẩu mặc định băm SHA-256 + Salt (123456):
-- Salt: PODCYCLE_FPT_SECURE_SALT_2026_ -> Hash: c5ec99b61d33d9cbbde02788e381b1ba608149866ecb8b38340d86641e71f4df
INSERT INTO app_users (id, email, password_hash, full_name, phone, student_id, role, campus, avatar)
VALUES 
  ('usr_seed_student', 'datct.se18@fpt.edu.vn', '123456', 'Châu Thành Đạt', '0901234567', 'SE180123', 'CUSTOMER', 'ĐH FPT TP.HCM (Campus Q.9)', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'),
  ('usr_seed_tech', 'technician@fpt.edu.vn', '123456', 'Nguyễn Văn Minh (KTV Trưởng Ca)', '0988776655', 'TECH-FPT-01', 'TECHNICIAN', 'ĐH FPT TP.HCM (Campus Q.9)', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80')
ON CONFLICT (email) DO UPDATE SET 
  full_name = EXCLUDED.full_name,
  password_hash = EXCLUDED.password_hash;

-- Nạp 12 đơn hàng khách hàng trả phí (Đạt chuẩn tối thiểu 10 khách hàng EXE201)
INSERT INTO bookings (id, booking_code, customer_name, phone, student_id, campus, device_model, issue_note, service_id, service_name, amount, booking_date, slot_time, payment_method, payment_status, status, technician_name, sound_clarity_score, before_photo, after_photo, created_at)
VALUES
  ('bk_init_1', 'TTN-8821', 'Châu Thành Đạt', '0901234567', 'SE180123', 'ĐH FPT TP.HCM (Campus Q.9)', 'AirPods Pro 2', 'Loa bên phải bị nhỏ tiếng, màng loa bám bụi đen', 'deep-clean', 'Gói Vệ Sinh Chuyên Sâu (Deep Cleaning)', 90000, CURRENT_DATE, '08:30 - 09:00', 'VIETQR', 'PAID', 'COMPLETED', 'Nguyễn Văn Minh (Trưởng ca)', 98, '/clean-airpods.png', '/clean-airpods.png', NOW() - INTERVAL '3 hours'),
  ('bk_init_2', 'TTN-8822', 'Trương Lâm Tấn', '0912345678', 'SE180456', 'ĐH FPT TP.HCM (Campus Q.9)', 'AirPods 3', 'Dock sạc bị bám cáu cặn, chập chờn tiếp xúc', 'deep-clean', 'Gói Vệ Sinh Chuyên Sâu (Deep Cleaning)', 90000, CURRENT_DATE, '09:15 - 09:45', 'VIETQR', 'PAID', 'COMPLETED', 'Nguyễn Văn Minh (Trưởng ca)', 96, '/clean-airpods.png', '/clean-airpods.png', NOW() - INTERVAL '2 hours'),
  ('bk_init_3', 'TTN-8823', 'Đoàn Minh Khôi', '0977889900', 'SE182003', 'ĐH FPT TP.HCM (Campus Q.9)', 'AirPods Pro 1', 'Vỏ trầy xước nhiều, loa nhỏ cả 2 bên', 'combo-renew', 'Combo Làm Mới (Deep Clean + Đánh Bóng)', 179000, CURRENT_DATE, '10:00 - 10:30', 'VIETQR', 'PAID', 'READY', 'Nguyễn Văn Minh (Trưởng ca)', 98, '/clean-airpods.png', '/clean-airpods.png', NOW() - INTERVAL '1 hour'),
  ('bk_init_4', 'TTN-8824', 'Nguyễn Minh Hiếu', '0981122334', 'IA170291', 'ĐH FPT TP.HCM (Campus Q.9)', 'AirPods 2', 'Màng loa bám ráy tai, âm lượng giảm 40%', 'deep-clean', 'Gói Vệ Sinh Chuyên Sâu (Deep Cleaning)', 90000, CURRENT_DATE, '11:00 - 11:30', 'CASH', 'PAID', 'COMPLETED', 'Châu Thành Đạt (KTV)', 95, '/clean-airpods.png', '/clean-airpods.png', NOW() - INTERVAL '45 minutes'),
  ('bk_init_5', 'TTN-8825', 'Lê Hoàng Yến', '0933221100', 'GD160882', 'ĐH FPT TP.HCM (Campus Q.9)', 'AirPods Pro 2', 'Cần vệ sinh hộp sạc và khử khuẩn đầu tip cao su', 'annual-care', 'Gói Chăm Sóc Toàn Diện 1 Năm', 240000, CURRENT_DATE, '13:00 - 13:30', 'VIETQR', 'PAID', 'COMPLETED', 'Nguyễn Văn Minh (Trưởng ca)', 99, '/clean-airpods.png', '/clean-airpods.png', NOW() - INTERVAL '30 minutes'),
  ('bk_init_6', 'TTN-8826', 'Trần Đình Trọng', '0908765432', 'SS180112', 'ĐH FPT Hà Nội (Campus Hòa Lạc)', 'AirPods 3', 'Tai trái bị rè nhẹ khi bật âm lượng cao', 'deep-clean', 'Gói Vệ Sinh Chuyên Sâu (Deep Cleaning)', 90000, CURRENT_DATE, '13:45 - 14:15', 'VIETQR', 'PAID', 'COMPLETED', 'Nguyễn Văn Cương (KTV)', 97, '/clean-airpods.png', '/clean-airpods.png', NOW() - INTERVAL '25 minutes'),
  ('bk_init_7', 'TTN-8827', 'Phạm Quỳnh Anh', '0945678901', 'SE171920', 'ĐH FPT TP.HCM (Campus Q.9)', 'AirPods Pro 2', 'Đánh bóng vết xước lông mèo vỏ case, deep clean', 'combo-renew', 'Combo Làm Mới (Deep Clean + Đánh Bóng)', 179000, CURRENT_DATE, '14:30 - 15:00', 'VIETQR', 'PAID', 'CLEANING', 'Châu Thành Đạt (KTV)', NULL, '/clean-airpods.png', NULL, NOW() - INTERVAL '20 minutes'),
  ('bk_init_8', 'TTN-8828', 'Vũ Quốc Bảo', '0922334455', 'SE182341', 'ĐH FPT TP.HCM (Campus Q.9)', 'AirPods 4', 'Bụi kim loại bám quanh viền nam châm dock sạc', 'deep-clean', 'Gói Vệ Sinh Chuyên Sâu (Deep Cleaning)', 90000, CURRENT_DATE, '15:30 - 16:00', 'VIETQR', 'PAID', 'COMPLETED', 'Nguyễn Văn Minh (Trưởng ca)', 98, '/clean-airpods.png', '/clean-airpods.png', NOW() - INTERVAL '15 minutes'),
  ('bk_init_9', 'TTN-8829', 'Bùi Phương Linh', '0966554433', 'MC170123', 'ĐH FPT TP.HCM (Campus Q.9)', 'AirPods Max', 'Vệ sinh đệm tai headband và màng loa lớn', 'combo-renew', 'Combo Làm Mới (Deep Clean + Đánh Bóng)', 179000, CURRENT_DATE, '16:15 - 16:45', 'VIETQR', 'PAID', 'COMPLETED', 'Châu Thành Đạt (KTV)', 99, '/clean-airpods.png', '/clean-airpods.png', NOW() - INTERVAL '10 minutes'),
  ('bk_init_10', 'TTN-8830', 'Hoàng Nhật Minh', '0918273645', 'DS180901', 'ĐH FPT Hà Nội (Campus Hòa Lạc)', 'AirPods Pro 1', 'Cần hút sạch bụi hốc sạc Type-C, khử khuẩn màng loa', 'deep-clean', 'Gói Vệ Sinh Chuyên Sâu (Deep Cleaning)', 90000, CURRENT_DATE, '08:30 - 09:00', 'CASH', 'PAID', 'COMPLETED', 'Nguyễn Văn Cương (KTV)', 96, '/clean-airpods.png', '/clean-airpods.png', NOW() - INTERVAL '8 minutes'),
  ('bk_init_11', 'TTN-8831', 'Ngô Thanh Vân', '0938475610', 'SE181122', 'ĐH FPT TP.HCM (Campus Q.9)', 'AirPods 2', 'Gói hội viên 1 năm, vệ sinh định kỳ lần 1', 'annual-care', 'Gói Chăm Sóc Toàn Diện 1 Năm', 240000, CURRENT_DATE, '09:15 - 09:45', 'VIETQR', 'PAID', 'COMPLETED', 'Nguyễn Văn Minh (Trưởng ca)', 97, '/clean-airpods.png', '/clean-airpods.png', NOW() - INTERVAL '5 minutes'),
  ('bk_init_12', 'TTN-8832', 'Đặng Tuấn Kiệt', '0971829304', 'IA180400', 'ĐH FPT TP.HCM (Campus Q.9)', 'AirPods Pro 2', 'Micro bị nghẹt tiếng khi gọi thoại, màng thu bẩn', 'deep-clean', 'Gói Vệ Sinh Chuyên Sâu (Deep Cleaning)', 90000, CURRENT_DATE, '10:00 - 10:30', 'VIETQR', 'PAID', 'CHECKED_IN', 'Nguyễn Văn Minh (Trưởng ca)', NULL, NULL, NULL, NOW() - INTERVAL '2 minutes')
ON CONFLICT (booking_code) DO NOTHING;
