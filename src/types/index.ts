export type DeviceModel = 
  | 'AirPods 2' 
  | 'AirPods 3' 
  | 'AirPods 4' 
  | 'AirPods Pro 1' 
  | 'AirPods Pro 2'
  | 'AirPods Max';

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
  | 'PENDING'       // Đã đặt, chờ nhận máy
  | 'CHECKED_IN'     // Staff đã nhận máy tại sảnh
  | 'CLEANING'       // Đang vệ sinh ngoại quan chuyên sâu
  | 'READY'          // Hoàn thành, chờ sinh viên đến lấy
  | 'COMPLETED'      // Đã test âm thanh và bàn giao thành công
  | 'CANCELLED';

export interface Booking {
  id: string;
  bookingCode: string;
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
  createdAt: string;
}

export interface TrackingEvent {
  id: string;
  name: string;
  timestamp: string;
  params: Record<string, any>;
}
