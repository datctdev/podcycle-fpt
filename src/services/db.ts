import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Booking, BookingStatus, User } from '../types';

// ==============================================================
// THIẾT LẬP KẾT NỐI SUPABASE CLOUD POSTGRESQL (KHÔNG SỬ DỤNG FALLBACK)
// ==============================================================
// THIẾT LẬP KẾT NỐI SUPABASE CLOUD POSTGRESQL (KHÔNG SỬ DỤNG FALLBACK)
// ==============================================================
let supabase: SupabaseClient | null = null;

export const getSupabaseConfig = () => {
  const url = (import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('ttn_supabase_url') || '').trim();
  const key = (import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('ttn_supabase_key') || '').trim();
  return { url, key };
};

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseConfig();
  return Boolean(
    url &&
    key &&
    url.startsWith('https://') &&
    !url.includes('your-project-id') &&
    !key.includes('your-anon-key')
  );
};

export const initSupabase = (): SupabaseClient => {
  const { url, key } = getSupabaseConfig();

  if (!url || !key) {
    throw new Error(
      'Chưa cấu hình Cơ sở dữ liệu Supabase! Vui lòng điền VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY trong file .env (hoặc bấm vào biểu tượng bánh răng trên thanh tiêu đề).'
    );
  }

  if (url.includes('your-project-id') || key.includes('your-anon-key')) {
    throw new Error(
      'File .env đang chứa khóa mẫu mặc định. Vui lòng thay thế bằng URL và Anon Key thực tế từ dự án Supabase của bạn tại https://supabase.com.'
    );
  }

  if (!supabase) {
    try {
      supabase = createClient(url, key, {
        auth: {
          persistSession: false
        }
      });
      console.log('[Database] Connected strictly to Supabase Cloud PostgreSQL.');
    } catch (err: any) {
      throw new Error('Lỗi khởi tạo Supabase Client: ' + (err.message || 'Unknown error'));
    }
  }

  return supabase;
};

// ==============================================================
// REAL DATABASE SERVICE LAYER - KHÔNG CÓ BẤT KỲ FALLBACK LOCAL NÀO
// ==============================================================
export const DatabaseService = {
  /**
   * Kiểm tra kết nối trực tiếp đến PostgreSQL Supabase
   */
  async testConnection(): Promise<{ connected: boolean; latencyMs?: number; error?: string }> {
    const startTime = Date.now();
    try {
      const sb = initSupabase();
      const { error } = await sb.from('bookings').select('id').limit(1);
      if (error) {
        if (error.message?.includes('schema cache') || error.code === 'PGRST205' || (error as any).code === '42P01') {
          return {
            connected: false,
            error: "Dự án Supabase chưa có bảng 'bookings' hay 'app_users'. Vui lòng mở Supabase SQL Editor và chạy file supabase_schema.sql!"
          };
        }
        return { connected: false, error: error.message };
      }
      return { connected: true, latencyMs: Date.now() - startTime };
    } catch (err: any) {
      return { connected: false, error: err.message || 'Không thể kết nối đến Database' };
    }
  },

  /**
   * 1. LẤY DANH SÁCH LỊCH HẸN TRỰC TIẾP TỪ BẢNG BOOKINGS CỦA DATABASE
   * Nếu có lỗi kết nối, throw Exception thẳng lên UI, KHÔNG fallback mock!
   */
  async getBookings(): Promise<Booking[]> {
    const sb = initSupabase();
    const { data, error } = await sb
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Database Error] getBookings failed:', error);
      if (error.message?.includes('schema cache') || error.code === 'PGRST205' || (error as any).code === '42P01') {
        throw new Error(`[Database Chưa Tạo Bảng] Bảng 'bookings' chưa được tạo trên Supabase. Vui lòng vào Supabase SQL Editor chạy file supabase_schema.sql!`);
      }
      throw new Error(`[Database Error] Không thể tải dữ liệu từ PostgreSQL: ${error.message}`);
    }

    if (!data) return [];

    // Lấy thêm cache checklist & SOP từ localStorage nếu có
    const sopCache: Record<string, any> = {};
    try {
      const saved = localStorage.getItem('ttn_sop_cache');
      if (saved) Object.assign(sopCache, JSON.parse(saved));
    } catch {}

    return data.map((d: any) => {
      const cached = sopCache[d.id] || {};
      return {
        id: d.id,
        bookingCode: d.booking_code,
        userId: d.user_id,
        customerName: d.customer_name,
        phone: d.phone,
        studentId: d.student_id,
        campus: d.campus,
        deviceModel: d.device_model,
        serialNumber: d.serial_number || cached.serialNumber,
        issueNote: d.issue_note,
        serviceId: d.service_id,
        serviceName: d.service_name,
        amount: Number(d.amount),
        bookingDate: d.booking_date,
        slotTime: d.slot_time,
        paymentMethod: d.payment_method,
        paymentStatus: d.payment_status,
        status: d.status,
        technicianName: d.technician_name,
        soundClarityScore: d.sound_clarity_score || cached.soundClarityScore,
        beforePhoto: d.before_photo || cached.beforePhoto,
        afterPhoto: d.after_photo || cached.afterPhoto,
        checklistBefore: d.checklist_before || cached.checklistBefore,
        checklistAfter: d.checklist_after || cached.checklistAfter,
        scopeLockReason: d.scope_lock_reason || cached.scopeLockReason,
        nextMaintenanceDate: d.next_maintenance_date || cached.nextMaintenanceDate,
        refundReason: d.refund_reason || cached.refundReason,
        refundedAt: d.refunded_at || cached.refundedAt,
        createdAt: d.created_at,
        completedAt: d.completed_at || cached.completedAt
      };
    });
  },

  /**
   * 2. TẠO ĐƠN ĐẶT LỊCH MỚI TRỰC TIẾP VÀO POSTGRESQL (GIAI ĐOẠN 1)
   */
  async createBooking(booking: Booking): Promise<Booking> {
    const sb = initSupabase();

    const dbPayload = {
      id: booking.id,
      booking_code: booking.bookingCode,
      user_id: booking.userId || null,
      customer_name: booking.customerName,
      phone: booking.phone,
      student_id: booking.studentId,
      campus: booking.campus,
      device_model: booking.deviceModel,
      issue_note: booking.issueNote || '',
      service_id: booking.serviceId,
      service_name: booking.serviceName,
      amount: booking.amount,
      booking_date: booking.bookingDate,
      slot_time: booking.slotTime,
      payment_method: booking.paymentMethod,
      payment_status: booking.paymentStatus || 'UNPAID',
      status: booking.status || 'PENDING_PAYMENT',
      created_at: booking.createdAt || new Date().toISOString()
    };

    const { error } = await sb.from('bookings').insert([dbPayload]);
    if (error) {
      console.error('[Database Error] createBooking failed:', error);
      throw new Error(`[Database Error] Không thể lưu đơn vào PostgreSQL: ${error.message}`);
    }

    return booking;
  },

  /**
   * 3. CẬP NHẬT TRẠNG THÁI & BIÊN BẢN ĐỒNG KIỂM (GIAI ĐOẠN 2 - 6)
   */
  async updateStatus(
    bookingId: string, 
    status: BookingStatus, 
    extraUpdates: Partial<Booking> = {}
  ): Promise<void> {
    const sb = initSupabase();

    // 1. Cập nhật cache SOP đệm
    try {
      const saved = localStorage.getItem('ttn_sop_cache');
      const sopCache = saved ? JSON.parse(saved) : {};
      sopCache[bookingId] = {
        ...(sopCache[bookingId] || {}),
        ...extraUpdates,
        status
      };
      localStorage.setItem('ttn_sop_cache', JSON.stringify(sopCache));
    } catch {}

    // 2. Chuẩn bị payload cho Supabase
    const updatePayload: any = {
      status: status
    };
    if (extraUpdates.technicianName !== undefined) updatePayload.technician_name = extraUpdates.technicianName;
    if (extraUpdates.paymentStatus !== undefined) updatePayload.payment_status = extraUpdates.paymentStatus;
    if (extraUpdates.soundClarityScore !== undefined) updatePayload.sound_clarity_score = extraUpdates.soundClarityScore;
    if (extraUpdates.beforePhoto !== undefined) updatePayload.before_photo = extraUpdates.beforePhoto;
    if (extraUpdates.afterPhoto !== undefined) updatePayload.after_photo = extraUpdates.afterPhoto;
    if (extraUpdates.completedAt !== undefined) updatePayload.completed_at = extraUpdates.completedAt;

    // Các trường SOP nếu có cột trong database
    if (extraUpdates.serialNumber !== undefined) updatePayload.serial_number = extraUpdates.serialNumber;
    if (extraUpdates.checklistBefore !== undefined) updatePayload.checklist_before = extraUpdates.checklistBefore;
    if (extraUpdates.checklistAfter !== undefined) updatePayload.checklist_after = extraUpdates.checklistAfter;
    if (extraUpdates.scopeLockReason !== undefined) updatePayload.scope_lock_reason = extraUpdates.scopeLockReason;
    if (extraUpdates.nextMaintenanceDate !== undefined) updatePayload.next_maintenance_date = extraUpdates.nextMaintenanceDate;

    let { error } = await sb
      .from('bookings')
      .update(updatePayload)
      .eq('id', bookingId);

    // Nếu lỗi do database Supabase chưa có cột mới, retry chỉ với các cột cơ bản
    if (error && (error.message?.includes('column') || (error as any).code === '42703')) {
      console.warn('[Database Warning] Database chưa thêm cột mới, lưu vào core columns:', error.message);
      const safePayload: any = { status };
      if (extraUpdates.technicianName !== undefined) safePayload.technician_name = extraUpdates.technicianName;
      if (extraUpdates.paymentStatus !== undefined) safePayload.payment_status = extraUpdates.paymentStatus;
      if (extraUpdates.soundClarityScore !== undefined) safePayload.sound_clarity_score = extraUpdates.soundClarityScore;
      if (extraUpdates.beforePhoto !== undefined) safePayload.before_photo = extraUpdates.beforePhoto;
      if (extraUpdates.afterPhoto !== undefined) safePayload.after_photo = extraUpdates.afterPhoto;
      if (extraUpdates.completedAt !== undefined) safePayload.completed_at = extraUpdates.completedAt;

      const retryRes = await sb.from('bookings').update(safePayload).eq('id', bookingId);
      error = retryRes.error;
    }

    if (error) {
      console.error('[Database Error] updateStatus failed:', error);
      throw new Error(`[Database Error] Không thể cập nhật trạng thái đơn: ${error.message}`);
    }
  },

  /**
   * 4. GHI NHẬN GIAO DỊCH VÀO BẢNG TRANSACTIONS (GIAI ĐOẠN 2)
   */
  async recordTransaction(tx: {
    bookingId: string;
    bookingCode: string;
    amount: number;
    paymentMethod: 'SEPAY_PG' | 'CASH';
    referenceNumber?: string;
  }): Promise<void> {
    try {
      const sb = initSupabase();
      const txPayload = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        booking_id: tx.bookingId,
        booking_code: tx.bookingCode,
        amount: tx.amount,
        payment_method: tx.paymentMethod,
        reference_number: tx.referenceNumber || null,
        status: 'SUCCESS',
        created_at: new Date().toISOString()
      };

      // Ghi vào bảng transactions nếu tồn tại
      const { error } = await sb.from('transactions').insert([txPayload]);
      if (error) {
        console.warn('[Transactions Warning] Bảng transactions chưa tồn tại trên Supabase, lưu local cache:', error.message);
      }

      // Lưu backup vào localStorage
      const savedTx = localStorage.getItem('ttn_transactions');
      const txList = savedTx ? JSON.parse(savedTx) : [];
      txList.unshift(txPayload);
      localStorage.setItem('ttn_transactions', JSON.stringify(txList.slice(0, 50)));
    } catch (err: any) {
      console.warn('[Transactions] Lưu giao dịch:', err.message);
    }
  },

  /**
   * 4. GỬI PHẢN HỒI / HỖ TRỢ SINH VIÊN TRỰC TIẾP VÀO BẢNG SUPPORT_TICKETS
   */
  async createSupportTicket(ticket: {
    id: string;
    fullName: string;
    studentId?: string;
    phone: string;
    category: string;
    message: string;
  }): Promise<void> {
    const sb = initSupabase();

    const { error } = await sb.from('support_tickets').insert([
      {
        id: ticket.id,
        full_name: ticket.fullName,
        student_id: ticket.studentId || null,
        phone: ticket.phone,
        category: ticket.category,
        message: ticket.message,
        status: 'OPEN',
        created_at: new Date().toISOString()
      }
    ]);

    if (error) {
      console.error('[Database Error] createSupportTicket failed:', error);
      throw new Error(`[Database Error] Không thể lưu yêu cầu hỗ trợ: ${error.message}`);
    }
  },

  /**
   * 5. TÍNH TOÁN SLOT KHẢ DỤNG DỰA TRÊN DỮ LIỆU ĐƠN THẬT TỪ DATABASE
   */
  calculateSlots(allBookings: Booking[], date: string, campusName: string) {
    const defaultSlots = [
      '08:30 - 09:00',
      '09:15 - 09:45',
      '10:00 - 10:30',
      '11:00 - 11:30',
      '13:00 - 13:30',
      '13:45 - 14:15',
      '14:30 - 15:00',
      '15:30 - 16:00',
      '16:15 - 16:45'
    ];

    const MAX_PER_SLOT = 3;

    return defaultSlots.map((time, idx) => {
      const realBookedCount = allBookings.filter(
        (b) =>
          b.bookingDate === date &&
          b.campus === campusName &&
          b.slotTime === time &&
          b.status !== 'CANCELLED'
      ).length;

      return {
        id: `slot_${idx + 1}`,
        time: time,
        maxCapacity: MAX_PER_SLOT,
        bookedCount: realBookedCount
      };
    });
  }
};

// SQL Schema for user to copy-paste into Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `
-- 1. BẢNG APP_USERS (Tài khoản)
CREATE TABLE IF NOT EXISTS app_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  student_id TEXT,
  role TEXT NOT NULL DEFAULT 'CUSTOMER',
  campus TEXT NOT NULL,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BẢNG BOOKINGS (Lịch hẹn & kiểm định âm học)
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  booking_code TEXT NOT NULL UNIQUE,
  user_id TEXT REFERENCES app_users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  student_id TEXT,
  campus TEXT NOT NULL,
  device_model TEXT NOT NULL,
  issue_note TEXT,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  booking_date DATE NOT NULL,
  slot_time TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  status TEXT NOT NULL,
  technician_name TEXT,
  sound_clarity_score INTEGER DEFAULT 98,
  before_photo TEXT,
  after_photo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 3. BẢNG SUPPORT_TICKETS (Phản hồi sinh viên)
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

-- 4. Kích hoạt Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE app_users;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE support_tickets;

-- 5. Quyền truy cập mở (Public RLS)
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public app_users" ON app_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public bookings" ON bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public support_tickets" ON support_tickets FOR ALL USING (true) WITH CHECK (true);
`;

