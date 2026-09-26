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

export type BookingStatus = 
  | 'PENDING'       // Chờ tiếp nhận tại sảnh
  | 'CHECKED_IN'     // Đã nhận máy, dán niêm phong
  | 'CLEANING'       // Đang bảo dưỡng & vệ sinh 30 phút
  | 'READY'          // Hoàn tất, chờ khách test âm & lấy máy
  | 'COMPLETED'      // Đã test đạt chuẩn, thanh toán & bàn giao
  | 'CANCELLED';

export interface Booking {
  id: string;
  bookingCode: string;
  userId?: string;
  customerName: string;
  phone: string;
  studentId: string;
  campus: string;
  deviceModel: DeviceModel;
  issueNote: string;
  serviceId: string;
  serviceName: string;
  amount: number;
  bookingDate: string;
  slotTime: string;
  paymentMethod: 'VIETQR' | 'CASH';
  paymentStatus: 'UNPAID' | 'PAID';
  status: BookingStatus;
  technicianName?: string;
  cleaningStartedAt?: string;
  completedAt?: string;
  soundClarityScore?: number; // e.g., 98%
  createdAt: string;
}

export interface TrackingEvent {
  id: string;
  name: string;
  timestamp: string;
  params: Record<string, any>;
}
