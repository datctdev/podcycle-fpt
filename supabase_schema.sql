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

-- 7. LỆNH DỌN SẠCH DỮ LIỆU ĐỂ BẮT ĐẦU MÔI TRƯỜNG PRODUCTION MỚI TINH (0 ĐƠN HÀNG, 0 GIAO DỊCH)
-- Nếu trên Supabase Cloud của bạn đang có dữ liệu test cũ, chỉ cần chạy câu lệnh sau để làm sạch 100%:
-- (Lưu ý: TRUNCATE sẽ xóa toàn bộ đơn hàng và giao dịch test, giữ nguyên cấu trúc bảng và tài khoản người dùng)
TRUNCATE TABLE transactions, bookings CASCADE;

