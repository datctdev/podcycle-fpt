import React, { useState } from 'react';
import { SERVICES, CAMPUSES, INITIAL_SLOTS } from '../services/dataInit';
import { ServiceItem, DeviceModel, Booking, TimeSlot } from '../types';
import { trackEvent } from '../utils/analytics';
import { 
  Calendar, Clock, MapPin, CheckCircle2, QrCode, 
  Smartphone, ArrowRight, ArrowLeft, ShieldAlert, Copy, ExternalLink 
} from 'lucide-react';

interface BookingFlowProps {
  initialService?: ServiceItem | null;
  onBookingCreated: (booking: Booking) => void;
  onBackToHome: () => void;
}

export const BookingFlow: React.FC<BookingFlowProps> = ({ 
  initialService, 
  onBookingCreated, 
  onBackToHome 
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<ServiceItem>(
    initialService || SERVICES[0]
  );
  const [selectedDevice, setSelectedDevice] = useState<DeviceModel>('AirPods Pro 2');
  const [selectedCampus, setSelectedCampus] = useState(CAMPUSES[0].id);
  
  // Date format YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(INITIAL_SLOTS[0]);

  // Student Info
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [studentId, setStudentId] = useState('');
  const [issueNote, setIssueNote] = useState('Loa nghe nhỏ một bên, dock sạc bám cặn đen');
  const [paymentMethod, setPaymentMethod] = useState<'VIETQR' | 'CASH'>('VIETQR');
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string }>({});

  // Created Booking State
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [copiedMemo, setCopiedMemo] = useState(false);

  // Device list
  const deviceList: DeviceModel[] = [
    'AirPods 2',
    'AirPods 3',
    'AirPods 4',
    'AirPods Pro 1',
    'AirPods Pro 2',
    'AirPods Max'
  ];

  // Step 1 to 2
  const handleProceedToSlot = () => {
    setStep(2);
  };

  // Step 2: Slot Selected
  const handleSelectSlot = (slot: TimeSlot) => {
    if (slot.bookedCount >= slot.maxCapacity) return;
    setSelectedSlot(slot);
    
    // GA4 Trigger: add_to_cart (Thêm vào giỏ / Chọn lịch hẹn)
    const campusObj = CAMPUSES.find(c => c.id === selectedCampus);
    trackEvent('add_to_cart', {
      item_id: selectedService.id,
      item_name: selectedService.name,
      price: selectedService.price,
      currency: 'VND',
      campus_name: campusObj?.name,
      selected_date: selectedDate,
      time_slot: slot.time
    });
  };

  // Step 2 to 3
  const handleProceedToCustomerInfo = () => {
    if (!selectedSlot) return;
    setStep(3);
  };

  // Validate Step 3
  const validateForm = () => {
    const errors: { name?: string; phone?: string } = {};
    if (!customerName.trim()) {
      errors.name = 'Vui lòng nhập họ và tên của bạn.';
    }
    const cleanPhone = phone.replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length !== 10 || !/^0\d{9}$/.test(cleanPhone)) {
      errors.phone = 'Số điện thoại không hợp lệ (cần đúng 10 số, bắt đầu bằng số 0).';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 3 to 4
  const handleProceedToPayment = () => {
    if (!validateForm()) return;

    // GA4 Trigger: generate_lead / sign_up (Đăng ký)
    const campusObj = CAMPUSES.find(c => c.id === selectedCampus);
    trackEvent('generate_lead', {
      method: 'student_booking_form',
      student_id: studentId || 'N/A',
      campus_name: campusObj?.name,
      device_model: selectedDevice
    });

    setStep(4);
  };

  // Final Step 4: Confirm Booking & Payment
  const handleConfirmBooking = () => {
    const campusObj = CAMPUSES.find(c => c.id === selectedCampus);
    const randomCode = 'TTN-' + Math.floor(1000 + Math.random() * 9000);
    
    const newBooking: Booking = {
      id: 'bk_' + Date.now(),
      bookingCode: randomCode,
      customerName: customerName.trim(),
      phone: phone.trim(),
      studentId: studentId.trim() || 'SE18xxxx',
      campus: campusObj?.name || 'ĐH FPT TP.HCM',
      deviceModel: selectedDevice,
      issueNote: issueNote.trim(),
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      amount: selectedService.price,
      bookingDate: selectedDate,
      slotTime: selectedSlot?.time || '09:00 - 09:30',
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === 'VIETQR' ? 'PAID' : 'UNPAID',
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    // GA4 Trigger: purchase (Thanh toán hoàn tất)
    trackEvent('purchase', {
      transaction_id: newBooking.bookingCode,
      value: newBooking.amount,
      currency: 'VND',
      payment_type: newBooking.paymentMethod,
      items: [
        {
          item_id: selectedService.id,
          item_name: selectedService.name,
          price: selectedService.price,
          quantity: 1
        }
      ]
    });

    setCreatedBooking(newBooking);
    onBookingCreated(newBooking);
    setStep(5);
  };

  const currentCampus = CAMPUSES.find(c => c.id === selectedCampus);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Progress indicator */}
      {step < 5 && (
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-slate-500 mb-2">
            <span className={step >= 1 ? 'text-blue-600 font-bold' : ''}>1. Chọn Dịch Vụ</span>
            <span className={step >= 2 ? 'text-blue-600 font-bold' : ''}>2. Chọn Lịch & Slot</span>
            <span className={step >= 3 ? 'text-blue-600 font-bold' : ''}>3. Thông Tin Sinh Viên</span>
            <span className={step >= 4 ? 'text-blue-600 font-bold' : ''}>4. Xác Nhận & Thanh Toán</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* STEP 1: Select Service & Device Model */}
      {step === 1 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Bước 1: Chọn Thiết Bị & Gói Vệ Sinh</h2>
            <p className="text-sm text-slate-500 mt-1">Chọn chính xác dòng AirPods của bạn để kỹ thuật viên chuẩn bị đầu hút và dung dịch phù hợp.</p>
          </div>

          {/* Device Model Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Dòng Tai Nghe Của Bạn:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {deviceList.map((model) => (
                <button
                  key={model}
                  type="button"
                  onClick={() => setSelectedDevice(model)}
                  className={`p-3.5 rounded-xl border text-sm font-medium transition-all text-left flex items-center justify-between ${
                    selectedDevice === model
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span>{model}</span>
                  {selectedDevice === model && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Service Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Gói Dịch Vụ Muốn Làm:</label>
            <div className="space-y-3">
              {SERVICES.map((srv) => (
                <div
                  key={srv.id}
                  onClick={() => setSelectedService(srv)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedService.id === srv.id
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">{srv.name}</span>
                      {srv.badge && (
                        <span className="text-[10px] bg-blue-600 text-white font-semibold px-2 py-0.5 rounded-full">
                          {srv.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{srv.description}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <span className="text-lg font-bold text-slate-900">{srv.price.toLocaleString('vi-VN')}đ</span>
                    <span className="block text-[11px] text-slate-500">{srv.duration} phút</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={onBackToHome}
              className="text-slate-600 hover:text-slate-900 text-sm font-medium"
            >
              Quay lại trang chủ
            </button>
            <button
              onClick={handleProceedToSlot}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md transition-all"
            >
              <span>Tiếp Tục Chọn Lịch</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Campus & Slot Picker */}
      {step === 2 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Bước 2: Chọn Campus & Khung Giờ Trống Real-Time</h2>
            <p className="text-sm text-slate-500 mt-1">Hệ thống giới hạn tối đa 3 tai nghe / slot để đảm bảo hoàn thành chuẩn 30 phút giữa ca học.</p>
          </div>

          {/* Campus selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Trực tiếp tại Campus:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CAMPUSES.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCampus(c.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedCampus === c.id
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>{c.name}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">{c.spot}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Ngày Hẹn:</label>
            <input
              type="date"
              value={selectedDate}
              min={todayStr}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-64 p-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Time Slot Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-slate-700">Khung Giờ Trực Sảnh Khả Dụng:</label>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Còn chỗ
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Đã kín chỗ
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {INITIAL_SLOTS.map((slot) => {
                const isFull = slot.bookedCount >= slot.maxCapacity;
                const isSelected = selectedSlot?.id === slot.id;

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={isFull}
                    onClick={() => handleSelectSlot(slot)}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      isFull 
                        ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60' 
                        : isSelected
                          ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{slot.time}</span>
                      {isSelected && !isFull && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="text-[11px] mt-1 text-slate-500">
                      {isFull ? (
                        <span className="text-red-500 font-medium">Hết slot</span>
                      ) : (
                        <span className="text-emerald-700 font-medium">
                          Còn {slot.maxCapacity - slot.bookedCount} chỗ trống
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
            <button
              onClick={handleProceedToCustomerInfo}
              disabled={!selectedSlot}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md transition-all"
            >
              <span>Điền Thông Tin Sinh Viên</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Student Contact & Problem Details */}
      {step === 3 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Bước 3: Thông Tin Sinh Viên & Triệu Chứng</h2>
            <p className="text-sm text-slate-500 mt-1">Thông tin dùng để in mã định danh lên hộp sạc và liên hệ giao máy tại sảnh.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Họ và Tên <span className="text-red-500">*</span>:
              </label>
              <input
                type="text"
                placeholder="VD: Châu Thành Đạt"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                }}
                className={`w-full p-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  formErrors.name ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                }`}
              />
              {formErrors.name && (
                <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Số Điện Thoại (Zalo) <span className="text-red-500">*</span>:
              </label>
              <input
                type="tel"
                placeholder="VD: 0901234567"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (formErrors.phone) setFormErrors({ ...formErrors, phone: undefined });
                }}
                className={`w-full p-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  formErrors.phone ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                }`}
              />
              {formErrors.phone && (
                <p className="text-xs text-red-600 mt-1">{formErrors.phone}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Mã Số Sinh Viên (MSSV FPT):
            </label>
            <input
              type="text"
              placeholder="VD: SE180123 (Không bắt buộc)"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Mô tả triệu chứng / Tình trạng tai nghe:
            </label>
            <textarea
              rows={3}
              value={issueNote}
              onChange={(e) => setIssueNote(e.target.value)}
              placeholder="VD: Loa bên phải bị nhỏ tiếng, màng loa bám bẩn đen, mic bị rè khi gọi..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
            <button
              onClick={handleProceedToPayment}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md transition-all"
            >
              <span>Tiếp Tục Thanh Toán</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Payment Confirmation */}
      {step === 4 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Bước 4: Xác Nhận Đơn & Phương Thức Thanh Toán</h2>
            <p className="text-sm text-slate-500 mt-1">Kiểm tra thông tin trước khi hoàn tất tạo vé hẹn điện tử.</p>
          </div>

          {/* Booking Summary Box */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Khách hàng:</span>
              <span className="font-semibold text-slate-900">{customerName} ({phone})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Thiết bị:</span>
              <span className="font-semibold text-slate-900">{selectedDevice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Campus & Địa điểm:</span>
              <span className="font-semibold text-slate-900">{currentCampus?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Lịch hẹn:</span>
              <span className="font-semibold text-blue-700">{selectedDate} (Khung giờ: {selectedSlot?.time})</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base">
              <span className="font-bold text-slate-800">Tổng thanh toán:</span>
              <span className="font-extrabold text-blue-600">{selectedService.price.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Chọn Phương Thức Thanh Toán:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div
                onClick={() => setPaymentMethod('VIETQR')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'VIETQR'
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <QrCode className="w-5 h-5 text-blue-600" />
                  <span>Chuyển Khoản VietQR SePay</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Quét mã QR tự động điền STK & số tiền {selectedService.price.toLocaleString('vi-VN')}đ, xác nhận tức thì.
                </p>
              </div>

              <div
                onClick={() => setPaymentMethod('CASH')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'CASH'
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                  <span>Tiền Mặt Tại Sảnh Tự Học</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Giao máy cho kỹ thuật viên tại trạm và thanh toán tiền mặt trực tiếp khi nhận lại tai nghe.
                </p>
              </div>

            </div>
          </div>

          {/* SePay Dynamic VietQR Mockup */}
          {paymentMethod === 'VIETQR' && (
            <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 flex flex-col sm:flex-row items-center gap-5">
              <div className="bg-white p-2 rounded-xl shadow-xs border border-slate-200 shrink-0">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=TIEMTAINHO_${selectedService.price}_${customerName}`}
                  alt="VietQR SePay" 
                  className="w-32 h-32"
                />
              </div>
              <div className="text-xs text-slate-600 space-y-1 w-full">
                <p className="font-bold text-slate-900 text-sm">Hướng dẫn chuyển khoản qua Ngân Hàng / MoMo:</p>
                <p>Ngân hàng: <strong>MB Bank (Quân Đội)</strong></p>
                <p>Số tài khoản: <strong>0388889999</strong></p>
                <p>Chủ tài khoản: <strong>TIEM TAI NHO - FPT CAMPUS</strong></p>
                <p>Số tiền: <strong className="text-blue-600">{selectedService.price.toLocaleString('vi-VN')}đ</strong></p>
                <p className="text-amber-700 bg-amber-100/80 p-1.5 rounded font-medium mt-1">
                  Hệ thống tự động kích hoạt vé hẹn ngay sau khi bấm Xác nhận.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
            <button
              onClick={handleConfirmBooking}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]"
            >
              <span>Xác Nhận Đặt Lịch ({selectedService.price.toLocaleString('vi-VN')}đ)</span>
              <CheckCircle2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Booking Confirmation Ticket (Vé Hẹn Điện Tử) */}
      {step === 5 && createdBooking && (
        <div className="space-y-6">
          
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-bold text-emerald-900 text-base">Đặt Lịch Vệ Sinh Thành Công!</h3>
              <p className="text-xs text-emerald-700">
                Vé hẹn điện tử đã được kích hoạt. Hãy mang tai nghe đến trạm đúng khung giờ hẹn để được phục vụ tốt nhất.
              </p>
            </div>
          </div>

          {/* Ticket Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">VÉ HẸN ĐIỆN TỬ O2O</span>
                <h3 className="text-2xl font-black tracking-tight mt-0.5 text-white">
                  MÃ ĐƠN: {createdBooking.bookingCode}
                </h3>
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full">
                {createdBooking.status === 'PENDING' ? 'Chờ Bàn Giao Máy' : 'Đã Xác Nhận'}
              </span>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Ticket Details */}
              <div className="md:col-span-8 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-xs text-slate-400 block">Khách hàng</span>
                    <strong className="text-slate-800">{createdBooking.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Số điện thoại</span>
                    <strong className="text-slate-800">{createdBooking.phone}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-xs text-slate-400 block">Thiết bị</span>
                    <strong className="text-slate-800">{createdBooking.deviceModel}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Dịch vụ</span>
                    <strong className="text-blue-700">{createdBooking.serviceName}</strong>
                  </div>
                </div>

                <div className="pb-3 border-b border-slate-100">
                  <span className="text-xs text-slate-400 block">Thời gian hẹn</span>
                  <strong className="text-slate-900 text-base">
                    {createdBooking.bookingDate} ({createdBooking.slotTime})
                  </strong>
                </div>

                <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Vị trí bàn giao máy:</span>
                  </div>
                  <p className="text-xs text-blue-800 mt-1">
                    {currentCampus?.spot}
                  </p>
                </div>
              </div>

              {/* QR Code Check-in */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TIEMTAINHO_CHECKIN_${createdBooking.bookingCode}`}
                  alt="QR Checkin"
                  className="w-32 h-32 rounded-lg shadow-xs"
                />
                <span className="text-[11px] text-slate-500 mt-2 font-medium">
                  Đưa mã QR này cho Staff trực tại sảnh tự học
                </span>
              </div>

            </div>

            {/* Ticket Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3">
              <span className="text-xs text-slate-500">
                Cam kết: Vệ sinh 30 phút • Hoàn phí 100% nếu không cải thiện âm lượng
              </span>
              <button
                onClick={onBackToHome}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg"
              >
                Về Trang Chủ
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
