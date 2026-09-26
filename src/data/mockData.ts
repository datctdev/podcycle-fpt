import { ServiceItem, TimeSlot, Booking } from '../types';

export const SERVICES: ServiceItem[] = [
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

export const CAMPUSES = [
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
  { id: 's2', time: '09:15 - 09:45', maxCapacity: 3, bookedCount: 3 }, // Full
  { id: 's3', time: '10:00 - 10:30', maxCapacity: 3, bookedCount: 2 },
  { id: 's4', time: '11:00 - 11:30', maxCapacity: 3, bookedCount: 0 },
  { id: 's5', time: '13:00 - 13:30', maxCapacity: 3, bookedCount: 1 },
  { id: 's6', time: '13:45 - 14:15', maxCapacity: 3, bookedCount: 2 },
  { id: 's7', time: '14:30 - 15:00', maxCapacity: 3, bookedCount: 0 },
  { id: 's8', time: '15:30 - 16:00', maxCapacity: 3, bookedCount: 0 },
  { id: 's9', time: '16:15 - 16:45', maxCapacity: 3, bookedCount: 1 }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b1',
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
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'b2',
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
    id: 'b3',
    bookingCode: 'TTN-8823',
    customerName: 'Nguyễn Văn Minh',
    phone: '0988776655',
    studentId: 'SE181122',
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
    createdAt: new Date(Date.now() - 900000).toISOString()
  }
];
