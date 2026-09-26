import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Booking, BookingStatus, User } from '../types';
import { INITIAL_SEED_BOOKINGS } from './dataInit';

export interface BankConfig {
  bankId: string;       // e.g. 'MB', 'VCB', 'TCB', 'TPB', 'ACB', 'BIDV', 'ICB'
  accountNo: string;    // Số tài khoản thật
  accountName: string;  // Tên chủ tài khoản không dấu
  bankName: string;     // Tên hiển thị
}

export const DEFAULT_BANK_CONFIG: BankConfig = {
  bankId: 'MB',
  accountNo: '0388889999',
  accountName: 'CHAU THANH DAT',
  bankName: 'MB Bank (Quân Đội)'
};

// Available banks in Vietnam
export const POPULAR_BANKS = [
  { id: 'MB', name: 'MB Bank (Ngân hàng Quân Đội)' },
  { id: 'VCB', name: 'Vietcombank (Ngoại Thương)' },
  { id: 'TCB', name: 'Techcombank (Kỹ Thương)' },
  { id: 'TPB', name: 'TPBank (Tiên Phong)' },
  { id: 'ACB', name: 'ACB (Á Châu)' },
  { id: 'BIDV', name: 'BIDV (Đầu tư & Phát triển)' },
  { id: 'ICB', name: 'VietinBank (Công Thương)' },
  { id: 'VPB', name: 'VPBank (Việt Nam Thịnh Vượng)' }
];

// Load Bank Config from storage or environment variables or default
export const getBankConfig = (): BankConfig => {
  try {
    const saved = localStorage.getItem('ttn_bank_config');
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return {
    bankId: import.meta.env.VITE_VIETQR_BANK_ID || DEFAULT_BANK_CONFIG.bankId,
    accountNo: import.meta.env.VITE_VIETQR_ACCOUNT_NO || DEFAULT_BANK_CONFIG.accountNo,
    accountName: import.meta.env.VITE_VIETQR_ACCOUNT_NAME || DEFAULT_BANK_CONFIG.accountName,
    bankName: import.meta.env.VITE_VIETQR_BANK_NAME || DEFAULT_BANK_CONFIG.bankName
  };
};

export const saveBankConfig = (config: BankConfig) => {
  localStorage.setItem('ttn_bank_config', JSON.stringify(config));
};

// Generate 100% REAL VietQR Standard Image URL (Napas 247)
export const generateRealVietQR = (
  bankConfig: BankConfig,
  amount: number,
  bookingCode: string
): string => {
  const cleanBank = bankConfig.bankId.trim();
  const cleanAcc = bankConfig.accountNo.trim();
  const cleanMemo = encodeURIComponent(`TTN ${bookingCode}`);
  const cleanName = encodeURIComponent(bankConfig.accountName.trim());
  
  // Official VietQR API format
  return `https://img.vietqr.io/image/${cleanBank}-${cleanAcc}-compact.png?amount=${amount}&addInfo=${cleanMemo}&accountName=${cleanName}`;
};

// Supabase Configuration
let supabase: SupabaseClient | null = null;

export const getSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('ttn_supabase_url') || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('ttn_supabase_key') || '';
  return { url, key };
};

export const initSupabase = () => {
  const { url, key } = getSupabaseConfig();
  if (url && key) {
    try {
      supabase = createClient(url, key);
      console.log('[Database] Connected to Supabase Cloud PostgreSQL!');
      return supabase;
    } catch (err) {
      console.warn('[Database] Failed to init Supabase:', err);
    }
  }
  return null;
};

// SQL Schema for user to copy-paste into Supabase SQL Editor if they create a new project
export const SUPABASE_SQL_SCHEMA = `
-- 1. BẢNG USERS (Xác thực tài khoản Sinh viên & Kỹ thuật viên)
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

-- 2. BẢNG BOOKINGS (Đơn đặt lịch & Hồ sơ kiểm định âm học)
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 3. Kích hoạt Realtime cho cả 2 bảng
ALTER PUBLICATION supabase_realtime ADD TABLE app_users;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

-- 4. Thêm tài khoản mẫu kiểm thử
INSERT INTO app_users (id, email, password_hash, full_name, phone, student_id, role, campus, avatar)
VALUES 
  ('usr_student_1', 'datct.se18@fpt.edu.vn', '123456', 'Châu Thành Đạt', '0901234567', 'SE180123', 'CUSTOMER', 'ĐH FPT TP.HCM (Campus Q.9)', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'),
  ('usr_tech_1', 'technician@fpt.edu.vn', '123456', 'Nguyễn Văn Minh (Kỹ Thuật Viên Trưởng Ca)', '0988776655', 'TECH-FPT-01', 'TECHNICIAN', 'ĐH FPT TP.HCM (Campus Q.9)', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80')
ON CONFLICT (email) DO NOTHING;
`;

// Real Database Service Layer
export const DatabaseService = {
  // 1. Fetch all bookings
  async getBookings(): Promise<Booking[]> {
    const sb = initSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          // Map DB snake_case to frontend camelCase
          return data.map((d: any) => ({
            id: d.id,
            bookingCode: d.booking_code,
            userId: d.user_id,
            customerName: d.customer_name,
            phone: d.phone,
            studentId: d.student_id,
            campus: d.campus,
            deviceModel: d.device_model,
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
            soundClarityScore: d.sound_clarity_score,
            beforePhoto: d.before_photo,
            afterPhoto: d.after_photo,
            createdAt: d.created_at,
            completedAt: d.completed_at
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local cache:', err);
      }
    }

    // Local fallback
    try {
      const local = localStorage.getItem('podcycle_bookings');
      if (local) return JSON.parse(local);
    } catch {}
    return INITIAL_SEED_BOOKINGS;
  },

  // 2. Create new booking
  async createBooking(booking: Booking): Promise<Booking> {
    const sb = initSupabase();
    if (sb) {
      try {
        const dbPayload = {
          id: booking.id,
          booking_code: booking.bookingCode,
          user_id: booking.userId,
          customer_name: booking.customerName,
          phone: booking.phone,
          student_id: booking.studentId,
          campus: booking.campus,
          device_model: booking.deviceModel,
          issue_note: booking.issueNote,
          service_id: booking.serviceId,
          service_name: booking.serviceName,
          amount: booking.amount,
          booking_date: booking.bookingDate,
          slot_time: booking.slotTime,
          payment_method: booking.paymentMethod,
          payment_status: booking.paymentStatus,
          status: booking.status,
          created_at: booking.createdAt
        };

        const { error } = await sb.from('bookings').insert([dbPayload]);
        if (error) console.warn('Supabase insert warning:', error);
      } catch (err) {
        console.warn('Supabase insert failed:', err);
      }
    }

    // Always update local cache
    try {
      const existing: Booking[] = JSON.parse(localStorage.getItem('podcycle_bookings') || '[]');
      const updated = [booking, ...existing.filter(b => b.id !== booking.id)];
      localStorage.setItem('podcycle_bookings', JSON.stringify(updated));
    } catch {}

    return booking;
  },

  // 3. Update status
  async updateStatus(
    bookingId: string, 
    status: BookingStatus, 
    extraUpdates: Partial<Booking> = {}
  ): Promise<void> {
    const sb = initSupabase();
    if (sb) {
      try {
        const updatePayload: any = {
          status: status
        };
        if (extraUpdates.technicianName) updatePayload.technician_name = extraUpdates.technicianName;
        if (extraUpdates.paymentStatus) updatePayload.payment_status = extraUpdates.paymentStatus;
        if (extraUpdates.soundClarityScore) updatePayload.sound_clarity_score = extraUpdates.soundClarityScore;
        if (extraUpdates.beforePhoto) updatePayload.before_photo = extraUpdates.beforePhoto;
        if (extraUpdates.afterPhoto) updatePayload.after_photo = extraUpdates.afterPhoto;
        if (extraUpdates.completedAt) updatePayload.completed_at = extraUpdates.completedAt;

        await sb.from('bookings').update(updatePayload).eq('id', bookingId);
      } catch (err) {
        console.warn('Supabase status update failed:', err);
      }
    }

    // Always update local cache
    try {
      const existing: Booking[] = JSON.parse(localStorage.getItem('podcycle_bookings') || '[]');
      const updated = existing.map(b => b.id === bookingId ? { ...b, status, ...extraUpdates } : b);
      localStorage.setItem('podcycle_bookings', JSON.stringify(updated));
    } catch {}
  },

  // 4. Calculate REAL Dynamic Slot Capacities from actual bookings!
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
      // Count real active bookings for this slot on this date & campus
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
