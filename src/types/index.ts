export type DeviceModel = 
  | 'AirPods 2' 
  | 'AirPods 3' 
  | 'AirPods 4' 
  | 'AirPods Pro 1' 
  | 'AirPods Pro 2'
  | 'AirPods Max';

export type UserRole = 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  studentId?: string;
  role: UserRole;
  campus?: string;
  avatar?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  description: string;
  badge?: string;
  features: string[];
}

export interface TimeSlot {
  id: string;
  time: string;
  maxCapacity: number;
  bookedCount: number;
}

/**
 * 6 Giai Đoạn Chuẩn Nghiệp Vụ O2O Station:
 * 1. PENDING_PAYMENT / PENDING: Đang tạo đơn trực tuyến, chờ thanh toán SePay
 * 2. CONFIRMED: Đã thanh toán, xuất Vé Hẹn Điện Tử (Digital Pass)
 * 3. CHECKED_IN: Đã tới sảnh, KTV quét QR vé hẹn & đang đồng kiểm lâm sàng Before
 * 4. PROCESSING / CLEANING: Đã nhận máy, đang vệ sinh chuyên sâu 30 phút (Countdown)
 * 5. READY_FOR_PICKUP / READY: Đo lường QA After đạt chuẩn, mời khách ra bàn test âm
 * 6. COMPLETED: Khách đeo test âm hài lòng, ký nghiệm thu, phát E-Receipt & hẹn nhắc 3 tháng
 * CANCELLED: Đơn bị hủy
 * REFUNDED: Scope lock từ chối do lỗi sâu phần cứng hoặc hoàn phí 100%
 */
export type BookingStatus = 
  | 'PENDING_PAYMENT'  // GĐ1: Chờ thanh toán trực tuyến
  | 'PENDING'          // Tương thích ngược: Chờ thanh toán / xác nhận
  | 'CONFIRMED'        // GĐ2: Đã thanh toán, đã có Vé Hẹn QR Pass
  | 'CHECKED_IN'       // GĐ3: Đã quét vé check-in tại bàn trực campus
  | 'PROCESSING'       // GĐ4: Đang vệ sinh chuyên sâu 30 phút
  | 'CLEANING'         // Tương thích ngược: Đang vệ sinh
  | 'READY_FOR_PICKUP' // GĐ5: QA After đạt chuẩn, chờ khách test âm
  | 'READY'            // Tương thích ngược: Chờ nhận máy
  | 'COMPLETED'        // GĐ6: Đã test âm, ký nghiệm thu, lưu E-Receipt
  | 'CANCELLED'        // Đã hủy
  | 'REFUNDED';        // Đã hoàn phí 100% / Scope Lock

// Biên bản đồng kiểm lâm sàng đầu vào (Giai đoạn 3)
export interface ClinicalChecklistBefore {
  serialNumber: string;               // Số Serial tai nghe/hộp sạc
  caseScratches: 'NONE' | 'LIGHT' | 'HEAVY'; // Mức độ trầy xước vỏ
  earpieceGrime: 'LIGHT' | 'MEDIUM' | 'SEVERE'; // Mức độ bám bẩn màng loa
  leftSpeakerWorking: boolean;         // Loa trái hoạt động
  rightSpeakerWorking: boolean;        // Loa phải hoạt động
  micWorking: boolean;                 // Micro thu âm tốt
  scopeLockIssue?: string;             // Lý do Scope lock nếu hỏng chip/chập nguồn
  customerAgreed: boolean;             // Khách hàng xác nhận đồng kiểm
  checkedAt: string;                   // Thời điểm kiểm tra
  technicianName: string;              // KTV thực hiện
}

// Biên bản kiểm thử chất lượng đo lường sau xử lý (Giai đoạn 5)
export interface ClinicalChecklistAfter {
  meshClearance: boolean;              // Độ thông thoáng màng loa ngoài
  balanceLR: boolean;                  // Cân bằng âm lượng 2 bên
  micClarity: boolean;                 // Độ nhạy micro sau khi làm sạch
  visualCleanliness: boolean;          // Soi đèn màng loa sạch cặn bám két
  soundScore: number;                  // Điểm phục hồi âm học (e.g., 98%)
  customerTestedAtCounter: boolean;    // Khách hàng nghe thử tại bàn
  satisfactionAgreed: boolean;         // Khách hàng hài lòng nghiệm thu
  completedAt: string;                 // Thời điểm hoàn tất
  testedBy: string;                    // Người kiểm định QA
}

// Bản ghi giao dịch thanh toán
export interface TransactionRecord {
  id: string;
  bookingId: string;
  bookingCode: string;
  amount: number;
  paymentMethod: 'SEPAY_PG' | 'CASH';
  referenceNumber?: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED';
  createdAt: string;
}

export interface Booking {
  id: string;
  bookingCode: string;
  userId?: string;
  customerName: string;
  phone: string;
  studentId: string;
  campus: string;
  deviceModel: DeviceModel;
  serialNumber?: string;
  issueNote: string;
  serviceId: string;
  serviceName: string;
  amount: number;
  bookingDate: string;
  slotTime: string;
  paymentMethod: 'VIETQR' | 'CASH';
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  status: BookingStatus;
  technicianName?: string;
  cleaningStartedAt?: string;
  completedAt?: string;
  soundClarityScore?: number; // e.g., 98%
  beforePhoto?: string;
  afterPhoto?: string;
  
  // Các trường nghiệp vụ SOP O2O mới:
  checklistBefore?: ClinicalChecklistBefore;
  checklistAfter?: ClinicalChecklistAfter;
  scopeLockReason?: string;
  nextMaintenanceDate?: string; // Ngày nhắc vệ sinh định kỳ (3 tháng sau)
  qrTicketCode?: string;        // Mã QR vé hẹn
  refundReason?: string;
  refundedAt?: string;

  createdAt: string;
}

export interface TrackingEvent {
  id: string;
  name: string;
  timestamp: string;
  params: Record<string, any>;
}
