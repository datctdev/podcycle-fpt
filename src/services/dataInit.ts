import { ServiceItem, Booking, User, TimeSlot } from '../types';
import { hashPassword } from './auth';
import { initSupabase, isSupabaseConfigured } from './db';

// 1. Danh mục dịch vụ chuẩn của trạm FPT PODCYCLE
export const SYSTEM_SERVICES: ServiceItem[] = [
  {
    id: 'deep-clean',
    name: 'Gói Vệ Sinh Chuyên Sâu (Deep Cleaning)',
    price: 90000,
    duration: 30,
    badge: 'Khuyên Dùng - Bán Chạy Nhất',
    description: 'Bảo dưỡng ngoại quan & rã cáu cặn màng loa bề ngoài, hút sạch bụi bẩn hốc sạc bằng công cụ chuyên dụng không gây ẩm mạch.',
    features: [
      'Lấy máy ngay sau 30 phút giữa các ca học',
      'Xử lý triệt để bụi bẩn màng loa, phục hồi âm lượng',
      'Khử khuẩn dock sạc & chân tiếp xúc Type-C/Lightning',
      'Cam kết hoàn tiền 100% nếu âm thanh không cải thiện'
    ]
  },
  {
    id: 'combo-renew',
    name: 'Combo Làm Mới (Deep Clean + Đánh Bóng)',
    price: 179000,
    duration: 45,
    badge: 'Ngoại Quan Như Mới',
    description: 'Kết hợp gói Deep Cleaning và đánh bóng mờ, xóa mờ vết xước lông mèo trên vỏ hộp sạc bằng bánh nỉ công nghệ cao.',
    features: [
      'Bao gồm toàn bộ quy trình của gói Deep Cleaning',
      'Đánh bóng mờ vỏ nhựa hộp sạc chuyên nghiệp',
      'Phục hồi độ sáng bóng và thẩm mỹ đến 85-90%',
      'Tặng kèm dán seal chống bụi kim loại'
    ]
  },
  {
    id: 'annual-care',
    name: 'Gói Chăm Sóc Toàn Diện 1 Năm',
    price: 240000,
    duration: 30,
    badge: 'Tiết Kiệm Cho Sinh Viên',
    description: 'Gói hội viên định kỳ gồm 4 lần vệ sinh chuyên sâu trong 1 năm học (chỉ tương đương 60.000đ/lần).',
    features: [
      '4 lần vệ sinh chuyên sâu bất kỳ lúc nào trong 12 tháng',
      'Ưu tiên giữ slot VIP không phải chờ đợi',
      'Miễn phí kiểm tra lỗi âm thanh lâm sàng',
      'Áp dụng chung cho 1 thiết bị chính chủ'
    ]
  }
];

// 2. Danh sách cơ sở / Bàn trực tiếp nhận FPT Campus (Chỉ phục vụ tại FPT TP.HCM Campus Q.9)
export const SYSTEM_CAMPUSES = [
  {
    id: 'fpt-hcm',
    name: 'ĐH FPT TP.HCM (Campus Q.9)',
    address: 'Đường D1, Khu Công Nghệ Cao, Long Thạnh Mỹ, TP. Thủ Đức',
    spot: 'Trạm Bàn Giao: Bàn Trực Sảnh Tự Học Tòa Nhà A (Cạnh Canteen)'
  }
];

export const INITIAL_SLOTS: TimeSlot[] = [
  { id: 's1', time: '08:30 - 09:00', maxCapacity: 3, bookedCount: 1 },
  { id: 's2', time: '09:15 - 09:45', maxCapacity: 3, bookedCount: 3 },
  { id: 's3', time: '10:00 - 10:30', maxCapacity: 3, bookedCount: 2 },
  { id: 's4', time: '11:00 - 11:30', maxCapacity: 3, bookedCount: 0 },
  { id: 's5', time: '13:00 - 13:30', maxCapacity: 3, bookedCount: 1 },
  { id: 's6', time: '13:45 - 14:15', maxCapacity: 3, bookedCount: 2 },
  { id: 's7', time: '14:30 - 15:00', maxCapacity: 3, bookedCount: 0 },
  { id: 's8', time: '15:30 - 16:00', maxCapacity: 3, bookedCount: 0 },
  { id: 's9', time: '16:15 - 16:45', maxCapacity: 3, bookedCount: 1 }
];

export const SERVICES = SYSTEM_SERVICES;
export const CAMPUSES = SYSTEM_CAMPUSES;

// 3. Khởi tạo dữ liệu hệ thống (DataInit) cho môi trường Production mới (Zero Mock / Fresh Start)
export const INITIAL_SEED_BOOKINGS: Booking[] = [];

export async function initProjectData(): Promise<void> {
  // Nếu chưa cấu hình Supabase hợp lệ, thông báo rõ ràng
  if (!isSupabaseConfigured()) {
    console.warn('[DataInit] Supabase chưa được cấu hình với key hợp lệ trong .env. Hãy cấu hình để kết nối Database thực tế.');
    return;
  }

  try {
    const sb = initSupabase();

    // 1. Kiểm tra bảng app_users trong PostgreSQL, nếu rỗng thì nạp tài khoản mẫu để quản trị viên & KTV có thể đăng nhập
    const { count: userCount, error: countErr } = await sb
      .from('app_users')
      .select('*', { count: 'exact', head: true });

    if (!countErr && (userCount === 0 || userCount === null)) {
      const studentPwHash = await hashPassword('123456');
      const techPwHash = await hashPassword('123456');

      await sb.from('app_users').insert([
        {
          id: 'usr_seed_student',
          full_name: 'Châu Thành Đạt',
          email: 'datct.se18@fpt.edu.vn',
          phone: '0901234567',
          student_id: 'SE180123',
          role: 'CUSTOMER',
          campus: 'ĐH FPT TP.HCM (Campus Q.9)',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          password_hash: studentPwHash
        },
        {
          id: 'usr_seed_tech',
          full_name: 'Nguyễn Văn Minh (Kỹ Thuật Viên Trưởng Ca)',
          email: 'technician@fpt.edu.vn',
          phone: '0988776655',
          student_id: 'TECH-FPT-01',
          role: 'TECHNICIAN',
          campus: 'ĐH FPT TP.HCM (Campus Q.9)',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
          password_hash: techPwHash
        }
      ]);
      console.log('[DataInit] Đã nạp thành công tài khoản KTV và Sinh viên vào bảng app_users trong PostgreSQL.');
    }

    // 2. Bảng bookings và transactions: KHÔNG nạp đơn giả lập nào (Trạng thái Production mới tinh 0 đơn hàng)
    console.log('[System] Khởi tạo dữ liệu Real Database thành công (Production Ready).');
  } catch (err: any) {
    console.warn('[DataInit] Lỗi kết nối Supabase khi khởi tạo:', err.message || err);
  }
}

