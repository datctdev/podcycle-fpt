import { ServiceItem, Booking, User, TimeSlot } from '../types';
import { hashPassword } from './auth';

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

// 2. Danh sách cơ sở / Bàn trực tiếp nhận FPT Campus
export const SYSTEM_CAMPUSES = [
  {
    id: 'fpt-hcm',
    name: 'ĐH FPT TP.HCM (Campus Q.9)',
    address: 'Đường D1, Khu Công Nghệ Cao, Long Thạnh Mỹ, TP. Thủ Đức',
    spot: 'Trạm Bàn Giao: Bàn Trực Sảnh Tự Học Tòa Nhà A (Cạnh Canteen)'
  },
  {
    id: 'fpt-hn',
    name: 'ĐH FPT Hà Nội (Campus Hòa Lạc)',
    address: 'Khu CNC Hòa Lạc, Km29 Đại lộ Thăng Long, Thạch Thất, Hà Nội',
    spot: 'Trạm Bàn Giao: Sảnh Beta Hall (Khu Vực Sinh Viên)'
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

// 3. Khởi tạo dữ liệu hệ thống (DataInit) mỗi khi chạy dự án
export const INITIAL_SEED_BOOKINGS: Booking[] = [
  {
    id: 'bk_init_1',
    bookingCode: 'TTN-8821',
    customerName: 'Châu Thành Đạt',
    phone: '0901234567',
    studentId: 'SE180123',
    campus: 'ĐH FPT TP.HCM (Campus Q.9)',
    deviceModel: 'AirPods Pro 2',
    issueNote: 'Loa bên phải bị nhỏ tiếng, màng loa bám bụi đen',
    serviceId: 'deep-clean',
    serviceName: 'Gói Vệ Sinh Chuyên Sâu (Deep Cleaning)',
    amount: 90000,
    bookingDate: new Date().toISOString().split('T')[0],
    slotTime: '08:30 - 09:00',
    paymentMethod: 'VIETQR',
    paymentStatus: 'PAID',
    status: 'CLEANING',
    technicianName: 'Nguyễn Văn Minh (Trưởng ca)',
    cleaningStartedAt: new Date(Date.now() - 900000).toISOString(),
    beforePhoto: '/clean-airpods.png',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'bk_init_2',
    bookingCode: 'TTN-8822',
    customerName: 'Trương Lâm Tấn',
    phone: '0912345678',
    studentId: 'SE180456',
    campus: 'ĐH FPT TP.HCM (Campus Q.9)',
    deviceModel: 'AirPods 3',
    issueNote: 'Dock sạc bị bám cáu cặn, chập chờn tiếp xúc',
    serviceId: 'deep-clean',
    serviceName: 'Gói Vệ Sinh Chuyên Sâu (Deep Cleaning)',
    amount: 90000,
    bookingDate: new Date().toISOString().split('T')[0],
    slotTime: '09:15 - 09:45',
    paymentMethod: 'CASH',
    paymentStatus: 'UNPAID',
    status: 'CHECKED_IN',
    createdAt: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'bk_init_3',
    bookingCode: 'TTN-8823',
    customerName: 'Đoàn Minh Khôi',
    phone: '0977889900',
    studentId: 'SE182003',
    campus: 'ĐH FPT TP.HCM (Campus Q.9)',
    deviceModel: 'AirPods Pro 1',
    issueNote: 'Vỏ trầy xước nhiều, loa nhỏ cả 2 bên',
    serviceId: 'combo-renew',
    serviceName: 'Combo Làm Mới (Deep Clean + Đánh Bóng)',
    amount: 179000,
    bookingDate: new Date().toISOString().split('T')[0],
    slotTime: '10:00 - 10:30',
    paymentMethod: 'VIETQR',
    paymentStatus: 'PAID',
    status: 'READY',
    technicianName: 'Nguyễn Văn Minh (Trưởng ca)',
    soundClarityScore: 98,
    beforePhoto: '/clean-airpods.png',
    afterPhoto: '/clean-airpods.png',
    createdAt: new Date(Date.now() - 900000).toISOString()
  }
];

export async function initProjectData(): Promise<void> {
  // 1. Khởi tạo tài khoản hệ thống (Nạp mật khẩu đã băm SHA-256)
  const usersKey = 'ttn_registered_users_db';
  const existingUsers = localStorage.getItem(usersKey);
  if (!existingUsers) {
    const studentPwHash = await hashPassword('123456');
    const techPwHash = await hashPassword('123456');

    const seedUsers: (User & { passwordHash: string })[] = [
      {
        id: 'usr_seed_student',
        fullName: 'Châu Thành Đạt',
        email: 'datct.se18@fpt.edu.vn',
        phone: '0901234567',
        studentId: 'SE180123',
        role: 'CUSTOMER',
        campus: 'ĐH FPT TP.HCM (Campus Q.9)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        passwordHash: studentPwHash
      },
      {
        id: 'usr_seed_tech',
        fullName: 'Nguyễn Văn Minh (Kỹ Thuật Viên Trưởng Ca)',
        email: 'technician@fpt.edu.vn',
        phone: '0988776655',
        studentId: 'TECH-FPT-01',
        role: 'TECHNICIAN',
        campus: 'ĐH FPT TP.HCM (Campus Q.9)',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        passwordHash: techPwHash
      }
    ];
    localStorage.setItem(usersKey, JSON.stringify(seedUsers));
  }

  // 2. Khởi tạo dữ liệu Đơn hàng nếu chưa có
  const bookingsKey = 'podcycle_bookings';
  if (!localStorage.getItem(bookingsKey)) {
    localStorage.setItem(bookingsKey, JSON.stringify(INITIAL_SEED_BOOKINGS));
  }

  // 3. Khởi tạo cấu hình Ngân hàng nhận VietQR mặc định nếu chưa có
  const bankKey = 'ttn_bank_config';
  if (!localStorage.getItem(bankKey)) {
    localStorage.setItem(
      bankKey,
      JSON.stringify({
        bankId: 'TP',
        accountNo: '07478087601',
        accountName: 'CHAU THANH DAT',
        bankName: 'TP Bank (Tiên Phong)'
      })
    );
  }

  console.log('[System] DataInit initialized successfully.');
}
