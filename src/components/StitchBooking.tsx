import React, { useState } from 'react';
import { CAMPUSES, SERVICES } from '../services/dataInit';
import { ServiceItem, DeviceModel, Booking, TimeSlot, User } from '../types';
import { trackEvent } from '../utils/analytics';
import { DatabaseService } from '../services/db';
import { getSePayConfig, generateSePayQRUrl } from '../services/sepay';

interface StitchBookingProps {
  initialService?: ServiceItem | null;
  currentUser?: User | null;
  allBookings: Booking[];
  onBookingSuccess: (booking: Booking) => void;
  onBack: () => void;
}

export const StitchBooking: React.FC<StitchBookingProps> = ({
  initialService,
  currentUser,
  allBookings,
  onBookingSuccess,
  onBack
}) => {
  // Selections
  const [selectedCampus, setSelectedCampus] = useState(CAMPUSES[0].id);
  const [selectedDevice, setSelectedDevice] = useState<DeviceModel>('AirPods Pro 2');
  const [selectedService, setSelectedService] = useState<ServiceItem>(
    initialService || SERVICES[0]
  );

  // SePay Configuration for Real VietQR
  const sepayConfig = getSePayConfig();

  // Dates: Next 5 days
  const dateOptions = [
    { label: 'Hôm nay', date: '2026-09-27', day: 'T7' },
    { label: 'Ngày mai', date: '2026-09-28', day: 'CN' },
    { label: '29/09', date: '2026-09-29', day: 'T2' },
    { label: '30/09', date: '2026-09-30', day: 'T3' },
    { label: '01/10', date: '2026-10-01', day: 'T4' }
  ];
  const [selectedDate, setSelectedDate] = useState<string>(dateOptions[0].date);

  const campusObj = CAMPUSES.find((c) => c.id === selectedCampus);

  // Dynamic slot calculation from REAL database bookings
  const dynamicSlots = DatabaseService.calculateSlots(
    allBookings,
    selectedDate,
    campusObj?.name || ''
  );

  const [selectedSlot, setSelectedSlot] = useState<TimeSlot>(dynamicSlots[0]);

  // Form: Autofill from currentUser if logged in
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [studentId, setStudentId] = useState(currentUser?.studentId || '');
  const [issueNote, setIssueNote] = useState('Loa nghẹt 1 bên, bụi bám màng loa');
  const [paymentMethod, setPaymentMethod] = useState<'VIETQR' | 'CASH'>('VIETQR');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  React.useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || '');
      setPhone(currentUser.phone || '');
      setStudentId(currentUser.studentId || '');
    }
  }, [currentUser]);

  const deviceModels: DeviceModel[] = [
    'AirPods 2',
    'AirPods 3',
    'AirPods 4',
    'AirPods Pro 1',
    'AirPods Pro 2',
    'AirPods Max'
  ];

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.bookedCount >= slot.maxCapacity) return;
    setSelectedSlot(slot);

    // GA4 Event: add_to_cart
    trackEvent('add_to_cart', {
      item_id: selectedService.id,
      item_name: selectedService.name,
      price: selectedService.price,
      currency: 'VND',
      time_slot: slot.time,
      booking_date: selectedDate,
      device_model: selectedDevice
    });
  };

  const handleValidateAndSubmit = () => {
    const err: { name?: string; phone?: string } = {};
    if (!fullName.trim()) err.name = 'Vui lòng nhập họ và tên.';
    const cleanPhone = phone.replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length !== 10 || !/^0\d{9}$/.test(cleanPhone)) {
      err.phone = 'Số điện thoại phải gồm 10 chữ số (bắt đầu bằng số 0).';
    }

    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }

    // GA4 Event: generate_lead / sign_up
    trackEvent('generate_lead', {
      student_id: studentId || 'N/A',
      device_model: selectedDevice,
      campus: selectedCampus
    });

    const bookingCode = 'PC-' + Math.floor(2000 + Math.random() * 8000);

    const newBooking: Booking = {
      id: 'bk_' + Date.now(),
      bookingCode: bookingCode,
      userId: currentUser?.id,
      customerName: fullName.trim(),
      phone: phone.trim(),
      studentId: studentId.trim() || 'SE18xxxx',
      campus: campusObj?.name || 'ĐH FPT TP.HCM',
      deviceModel: selectedDevice,
      issueNote: issueNote.trim(),
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      amount: selectedService.price,
      bookingDate: selectedDate,
      slotTime: selectedSlot.time,
      paymentMethod: paymentMethod,
      paymentStatus: 'UNPAID',
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    // GA4 Event: purchase
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

    onBookingSuccess(newBooking);
  };

  return (
    <div className="pt-20 pb-24 px-4 sm:px-6 max-w-3xl mx-auto space-y-6">
      
      {/* Header with Back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 active:scale-95 transition-transform shadow-xs"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div>
          <h1 className="font-heading font-bold text-xl text-[#0b1c30]">Đặt Lịch Vệ Sinh</h1>
          <p className="text-slate-500 text-xs">
            {currentUser ? `Chào mừng ${currentUser.fullName}, thông tin đã được tự động điền` : 'Điền thông tin và chọn slot hẹn 30 phút giữa ca học'}
          </p>
        </div>
      </div>

      {/* 1. CAMPUS SELECTOR */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <label className="font-heading font-bold text-sm text-[#0b1c30] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#f26f21] text-[18px]">location_on</span>
          <span>1. Chọn Cơ Sở / Campus FPT:</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CAMPUSES.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCampus(c.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                selectedCampus === c.id
                  ? 'border-[#f26f21] bg-orange-50/50 ring-2 ring-[#f26f21]/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className="font-bold text-xs text-[#0b1c30]">{c.name}</p>
              <p className="text-[11px] text-slate-500 mt-1">{c.spot}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. DEVICE MODEL SELECTOR */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <label className="font-heading font-bold text-sm text-[#0b1c30] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#f26f21] text-[18px]">headphones</span>
          <span>2. Chọn Dòng Thiết Bị:</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {deviceModels.map((model) => (
            <button
              key={model}
              type="button"
              onClick={() => setSelectedDevice(model)}
              className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                selectedDevice === model
                  ? 'border-[#f26f21] bg-[#f26f21] text-white shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
              }`}
            >
              {model}
            </button>
          ))}
        </div>
      </div>

      {/* 3. DATE SELECTOR CHIPS */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <label className="font-heading font-bold text-sm text-[#0b1c30] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#f26f21] text-[18px]">calendar_today</span>
          <span>3. Chọn Ngày Hẹn:</span>
        </label>
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {dateOptions.map((opt) => (
            <button
              key={opt.date}
              type="button"
              onClick={() => setSelectedDate(opt.date)}
              className={`px-4 py-2.5 rounded-xl border text-center shrink-0 transition-all ${
                selectedDate === opt.date
                  ? 'border-[#f26f21] bg-orange-50 text-[#f26f21] font-bold ring-2 ring-[#f26f21]/20'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50 font-medium'
              }`}
            >
              <span className="block text-[10px] text-slate-400 font-bold uppercase">{opt.day}</span>
              <span className="text-xs">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. REAL DYNAMIC TIME SLOTS (CALCULATED FROM DATABASE) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex justify-between items-center">
          <label className="font-heading font-bold text-sm text-[#0b1c30] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#f26f21] text-[18px]">schedule</span>
            <span>4. Khung Giờ Trực Sảnh (30 Phút):</span>
          </label>
          <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
            Dữ liệu slot thực tế (Tối đa 3 máy/ca)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {dynamicSlots.map((slot) => {
            const isFull = slot.bookedCount >= slot.maxCapacity;
            const isSelected = selectedSlot.id === slot.id;

            return (
              <button
                key={slot.id}
                type="button"
                disabled={isFull}
                onClick={() => handleSlotClick(slot)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isFull
                    ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                    : isSelected
                      ? 'border-[#f26f21] bg-[#f26f21] text-white shadow-xs'
                      : 'border-slate-200 hover:border-orange-300 text-slate-800 bg-slate-50/50'
                }`}
              >
                <div className="font-bold text-xs">{slot.time}</div>
                <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : isFull ? 'text-red-500' : 'text-emerald-600'}`}>
                  {isFull ? 'Đã hết slot' : `Còn ${slot.maxCapacity - slot.bookedCount} chỗ trống`}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. SERVICE SELECTION */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <label className="font-heading font-bold text-sm text-[#0b1c30] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#f26f21] text-[18px]">award_star</span>
          <span>5. Gói Dịch Vụ:</span>
        </label>
        <div className="space-y-2.5">
          {SERVICES.map((srv) => (
            <div
              key={srv.id}
              onClick={() => setSelectedService(srv)}
              className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                selectedService.id === srv.id
                  ? 'border-[#f26f21] bg-orange-50/60 ring-2 ring-[#f26f21]/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#0b1c30]">{srv.name}</span>
                  {srv.badge && (
                    <span className="bg-[#f26f21] text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                      {srv.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{srv.description}</p>
              </div>
              <div className="text-right shrink-0 ml-3">
                <span className="font-black text-sm text-[#f26f21]">
                  {srv.price.toLocaleString('vi-VN')}đ
                </span>
                <span className="block text-[10px] text-slate-400">{srv.duration} phút</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. STUDENT INFO & ISSUE */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <label className="font-heading font-bold text-sm text-[#0b1c30] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#f26f21] text-[18px]">person</span>
          <span>6. Thông Tin Sinh Viên & Triệu Chứng:</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <input
              type="text"
              placeholder="Họ và tên *"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              className={`w-full p-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-[#f26f21] focus:outline-none ${
                errors.name ? 'border-red-500 bg-red-50/20' : 'border-slate-300'
              }`}
            />
            {errors.name && <p className="text-[10px] text-red-600 mt-1">{errors.name}</p>}
          </div>

          <div>
            <input
              type="tel"
              placeholder="Số điện thoại / Zalo *"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors({ ...errors, phone: undefined });
              }}
              className={`w-full p-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-[#f26f21] focus:outline-none ${
                errors.phone ? 'border-red-500 bg-red-50/20' : 'border-slate-300'
              }`}
            />
            {errors.phone && <p className="text-[10px] text-red-600 mt-1">{errors.phone}</p>}
          </div>
        </div>

        <div>
          <input
            type="text"
            placeholder="MSSV (VD: SE180123)"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#f26f21] focus:outline-none"
          />
        </div>

        <div>
          <textarea
            rows={2}
            value={issueNote}
            onChange={(e) => setIssueNote(e.target.value)}
            placeholder="Mô tả lỗi âm thanh hoặc bám bẩn (để kỹ thuật viên kiểm tra lâm sàng)..."
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#f26f21] focus:outline-none"
          />
        </div>
      </div>

      {/* 7. REAL VIETQR PAYMENT METHOD */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <label className="font-heading font-bold text-sm text-[#0b1c30] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#f26f21] text-[18px]">payments</span>
          <span>7. Phương Thức Thanh Toán (VietQR Chuẩn Napas):</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={() => setPaymentMethod('VIETQR')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              paymentMethod === 'VIETQR'
                ? 'border-[#f26f21] bg-orange-50/50 ring-2 ring-[#f26f21]/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-[#0b1c30]">
              <span className="material-symbols-outlined text-[#f26f21] text-[18px]">qr_code_2</span>
              <span>Chuyển khoản SePay (Napas 24/7)</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Quét từ app ngân hàng thật (VCB, MB, Techcombank, MoMo...), tự động điền STK & số tiền
            </p>
          </div>

          <div
            onClick={() => setPaymentMethod('CASH')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              paymentMethod === 'CASH'
                ? 'border-[#f26f21] bg-orange-50/50 ring-2 ring-[#f26f21]/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-[#0b1c30]">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">local_atm</span>
              <span>Tiền mặt tại sảnh tự học</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Thanh toán trực tiếp sau khi nghe thử âm thanh</p>
          </div>
        </div>

        {paymentMethod === 'VIETQR' && (
          <div className="bg-orange-50/70 p-4 rounded-xl border border-orange-200 flex items-center gap-3.5 text-xs text-slate-700">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#f26f21] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">qr_code_scanner</span>
            </div>
            <div className="space-y-0.5">
              <p className="font-bold text-[#0b1c30]">Cổng Thanh Toán Tự Động SePay (VietQR Napas 24/7)</p>
              <p className="text-[11px] text-slate-500">
                Sau khi bấm <strong>"Xác Nhận Đặt Lịch"</strong>, hệ thống sẽ tạo mã QR thanh toán riêng cho đơn hàng này kèm cú pháp chuyển khoản chính xác để bạn quét mã.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CONFIRMATION FOOTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-md flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Tổng thanh toán:</span>
          <span className="font-heading font-black text-xl text-[#f26f21]">
            {selectedService.price.toLocaleString('vi-VN')}đ
          </span>
        </div>

        <button
          onClick={handleValidateAndSubmit}
          className="fpt-gradient fpt-gradient-hover text-white font-bold text-xs sm:text-sm px-7 py-3 rounded-full shadow-md active:scale-95 transition-all flex items-center gap-2"
        >
          <span>Xác Nhận Giữ Slot</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>

    </div>
  );
};
