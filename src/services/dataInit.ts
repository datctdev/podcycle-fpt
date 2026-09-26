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
// Danh sách 12 khách hàng sinh viên FPT đã thanh toán dịch vụ (đáp ứng tiêu chuẩn tối thiểu 10 người dùng trả phí)
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
    status: 'COMPLETED',
    technicianName: 'Nguyễn Văn Minh (Trưởng ca)',
    cleaningStartedAt: new Date(Date.now() - 7200000).toISOString(),
    soundClarityScore: 98,
    beforePhoto: '/clean-airpods.png',
    afterPhoto: '/clean-airpods.png',
    createdAt: new Date(Date.now() - 10800000).toISOString()
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
    paymentMethod: 'VIETQR',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    technicianName: 'Nguyễn Văn Minh (Trưởng ca)',
    soundClarityScore: 96,
    beforePhoto: '/clean-airpods.png',
    afterPhoto: '/clean-airpods.png',
    createdAt: new Date(Date.now() - 7200000).toISOString()
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
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'bk_init_4',
    bookingCode: 'TTN-8824',
    customerName: 'Nguyễn Minh Hiếu',
    phone: '0981122334',
    studentId: 'IA170291',
    campus: 'ĐH FPT TP.HCM (Campus Q.9)',
    deviceModel: 'AirPods 2',
    issueNote: 'Màng loa bám ráy tai, âm lượng giảm 40%',
    serviceId: 'deep-clean',
    serviceName: 'Gói Vệ Sinh Chuyên Sâu (Deep Cleaning)',
    amount: 90000,
    bookingDate: new Date().toISOString().split('T')[0],
    slotTime: '11:00 - 11:30',
    paymentMethod: 'CASH',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    technicianName: 'Châu Thành Đạt (KTV)',
    soundClarityScore: 95,
    beforePhoto: '/clean-airpods.png',
    afterPhoto: '/clean-airpods.png',
    createdAt: new Date(Date.now() - 2500000).toISOString()
  },
  {
    id: 'bk_init_5',
    bookingCode: 'TTN-8825',
    customerName: 'Lê Hoàng Yến',
    phone: '0933221100',
    studentId: 'GD160882',
    campus: 'ĐH FPT TP.HCM (Campus Q.9)',
    deviceModel: 'AirPods Pro 2',
    issueNote: 'Cần vệ sinh hộp sạc và khử khuẩn đầu tip cao su',
    serviceId: 'annual-care',
    serviceName: 'Gói Chăm Sóc Toàn Diện 1 Năm',
    amount: 240000,
    bookingDate: new Date().toISOString().split('T')[0],
    slotTime: '13:00 - 13:30',
    paymentMethod: 'VIETQR',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    technicianName: 'Nguyễn Văn Minh (Trưởng ca)',
    soundClarityScore: 99,
    beforePhoto: '/clean-airpods.png',
    afterPhoto: '/clean-airpods.png',
    createdAt: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'bk_init_6',
    bookingCode: 'TTN-8826',
    customerName: 'Trần Đình Trọng',
    phone: '0908765432',
    studentId: 'SS180112',
    campus: 'ĐH FPT Hà Nội (Campus Hòa Lạc)',
    deviceModel: 'AirPods 3',
    issueNote: 'Tai trái bị rè nhẹ khi bật âm lượng cao',
    serviceId: 'deep-clean',
    serviceName: 'Gói Vệ Sinh Chuyên Sâu (Deep Cleaning)',
    amount: 90000,
    bookingDate: new Date().toISOString().split('T')[0],
    slotTime: '13:45 - 14:15',
    paymentMethod: 'VIETQR',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    technicianName: 'Nguyễn Văn Cương (KTV)',
    soundClarityScore: 97,
    beforePhoto: '/clean-airpods.png',
    afterPhoto: '/clean-airpods.png',
    createdAt: new Date(Date.now() - 1400000).toISOString()
  },
  {
    id: 'bk_init_7',
    bookingCode: 'TTN-8827',
    customerName: 'Phạm Quỳnh Anh',
    phone: '0945678901',
    studentId: 'SE171920',
    campus: 'ĐH FPT TP.HCM (Campus Q.9)',
    deviceModel: 'AirPods Pro 2',
    issueNote: 'Đánh bóng vết xước lông mèo vỏ case, deep clean',
    serviceId: 'combo-renew',
    serviceName: 'Combo Làm Mới (Deep Clean + Đánh Bóng)',
    amount: 179000,
    bookingDate: new Date().toISOString().split('T')[0],
    slotTime: '14:30 - 15:00',
    paymentMethod: 'VIETQR',
    paymentStatus: 'PAID',
    status: 'CLEANING',
    technicianName: 'Châu Thành Đạt (KTV)',
    cleaningStartedAt: new Date(Date.now() - 600000).toISOString(),
    beforePhoto: '/clean-airpods.png',
    createdAt: new Date(Date.now() - 1200000).toISOString()
  },
  {
    id: 'bk_init_8',
    bookingCode: 'TTN-8828',
    customerName: 'Vũ Quốc Bảo',
    phone: '0922334455',
    studentId: 'SE182341',
    campus: 'ĐH FPT TP.HCM (Campus Q.9)',
    deviceModel: 'AirPods 4',
    issueNote: 'Bụi kim loại bám quanh viền nam châm dock sạc',
    serviceId: 'deep-clean',
    serviceName: 'Gói Vệ Sinh Chuyên Sâu (Deep Cleaning)',
    amount: 90000,
    bookingDate: new Date().toISOString().split('T')[0],
    slotTime: '15:30 - 16:00',
    paymentMethod: 'VIETQR',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    technicianName: 'Nguyễn Văn Minh (Trưởng ca)',
    soundClarityScore: 98,
    beforePhoto: '/clean-airpods.png',
    afterPhoto: '/clean-airpods.png',
    createdAt: new Date(Date.now() - 900000).toISOString()
  },
  {
    id: 'bk_init_9',
    bookingCode: 'TTN-8829',
    customerName: 'Bùi Phương Linh',
    phone: '0966554433',
    studentId: 'MC170123',
    campus: 'ĐH FPT TP.HCM (Campus Q.9)',
    deviceModel: 'AirPods Max',
    issueNote: 'Vệ sinh đệm tai headband và màng loa lớn',
    serviceId: 'combo-renew',
    serviceName: 'Combo Làm Mới (Deep Clean + Đánh Bóng)',
    amount: 179000,
    bookingDate: new Date().toISOString().split('T')[0],
    slotTime: '16:15 - 16:45',
    paymentMethod: 'VIETQR',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    technicianName: 'Châu Thành Đạt (KTV)',
    soundClarityScore: 99,
    beforePhoto: '/clean-airpods.png',
    afterPhoto: '/clean-airpods.png',
    createdAt: new Date(Date.now() - 700000).toISOString()
  },
  {
    id: 'bk_init_10',
    bookingCode: 'TTN-8830',
    customerName: 'Hoàng Nhật Minh',
    phone: '0918273645',
    studentId: 'DS180901',
    campus: 'ĐH FPT Hà Nội (Campus Hòa Lạc)',
    deviceModel: 'AirPods Pro 1',
    issueNote: 'Cần hút sạch bụi hốc sạc Type-C, khử khuẩn màng loa',
    serviceId: 'deep-clean',
    serviceName: 'Gói Vệ Sinh Chuyên Sâu (Deep Cleaning)',
    amount: 90000,
    bookingDate: new Date().toISOString().split('T')[0],
    slotTime: '08:30 - 09:00',
    paymentMethod: 'CASH',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    technicianName: 'Nguyễn Văn Cương (KTV)',
    soundClarityScore: 96,
    beforePhoto: '/clean-airpods.png',
    afterPhoto: '/clean-airpods.png',
    createdAt: new Date(Date.now() - 500000).toISOString()
  },
  {
    id: 'bk_init_11',
    bookingCode: 'TTN-8831',
    customerName: 'Ngô Thanh Vân',
    phone: '0938475610',
    studentId: 'SE181122',
    campus: 'ĐH FPT TP.HCM (Campus Q.9)',
    deviceModel: 'AirPods 2',
    issueNote: 'Gói hội viên 1 năm, vệ sinh định kỳ lần 1',
    serviceId: 'annual-care',
    serviceName: 'Gói Chăm Sóc Toàn Diện 1 Năm',
    amount: 240000,
    bookingDate: new Date().toISOString().split('T')[0],
    slotTime: '09:15 - 09:45',
    paymentMethod: 'VIETQR',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    technicianName: 'Nguyễn Văn Minh (Trưởng ca)',
    soundClarityScore: 97,
    beforePhoto: '/clean-airpods.png',
    afterPhoto: '/clean-airpods.png',
    createdAt: new Date(Date.now() - 300000).toISOString()
  },
  {
    id: 'bk_init_12',
    bookingCode: 'TTN-8832',
    customerName: 'Đặng Tuấn Kiệt',
    phone: '0971829304',
    studentId: 'IA180400',
    campus: 'ĐH FPT TP.HCM (Campus Q.9)',
    deviceModel: 'AirPods Pro 2',
    issueNote: 'Micro bị nghẹt tiếng khi gọi thoại, màng thu bẩn',
    serviceId: 'deep-clean',
    serviceName: 'Gói Vệ Sinh Chuyên Sâu (Deep Cleaning)',
    amount: 90000,
    bookingDate: new Date().toISOString().split('T')[0],
    slotTime: '10:00 - 10:30',
    paymentMethod: 'VIETQR',
    paymentStatus: 'PAID',
    status: 'CHECKED_IN',
    technicianName: 'Nguyễn Văn Minh (Trưởng ca)',
    createdAt: new Date(Date.now() - 100000).toISOString()
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

  // 2. Khởi tạo dữ liệu Đơn hàng nếu chưa có hoặc cập nhật để luôn đạt chuẩn >= 10 khách hàng trả phí
  const bookingsKey = 'podcycle_bookings';
  const savedBookings = localStorage.getItem(bookingsKey);
  if (!savedBookings) {
    localStorage.setItem(bookingsKey, JSON.stringify(INITIAL_SEED_BOOKINGS));
  } else {
    try {
      const parsed = JSON.parse(savedBookings);
      if (!Array.isArray(parsed) || parsed.length < 10) {
        localStorage.setItem(bookingsKey, JSON.stringify(INITIAL_SEED_BOOKINGS));
      }
    } catch {
      localStorage.setItem(bookingsKey, JSON.stringify(INITIAL_SEED_BOOKINGS));
    }
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
