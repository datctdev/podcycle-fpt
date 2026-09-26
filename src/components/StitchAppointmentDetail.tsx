import React from 'react';
import { Booking } from '../types';

interface StitchAppointmentDetailProps {
  booking: Booking;
  onBack: () => void;
  onOpenReview: () => void;
}

export const StitchAppointmentDetail: React.FC<StitchAppointmentDetailProps> = ({
  booking,
  onBack,
  onOpenReview
}) => {
  return (
    <div className="pt-20 pb-28 px-4 sm:px-6 max-w-2xl mx-auto space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <h1 className="font-heading font-bold text-lg text-[#0b1c30]">Chi Tiết Lịch Hẹn</h1>
        </div>

        <button
          onClick={onOpenReview}
          className="bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px] text-amber-600 active-icon">star</span>
          <span>Đánh giá 5★</span>
        </button>
      </div>

      {/* 1. Status & ID Card (Matching Stitch UI) */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/90 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block">Mã đơn hàng</span>
            <p className="font-heading font-extrabold text-2xl text-[#0b1c30] tracking-tight">
              {booking.bookingCode}
            </p>
          </div>
          
          <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-emerald-200">
            <span className="material-symbols-outlined text-[16px] active-icon text-emerald-600">
              check_circle
            </span>
            <span>
              {booking.status === 'PENDING' ? 'Chờ Bàn Giao' : booking.status === 'CLEANING' ? 'Đang Vệ Sinh 30p' : 'Đã Hoàn Thành'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
          <span className="material-symbols-outlined text-[18px] text-[#f26f21]">calendar_month</span>
          <span className="font-semibold text-slate-900">{booking.bookingDate} — {booking.slotTime}</span>
        </div>
      </div>

      {/* 2. Map Snippet Card (Matching Stitch UI) */}
      <div className="relative w-full h-44 rounded-2xl overflow-hidden shadow-xs border border-slate-200 group">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80')`
          }}
        />
        <div className="absolute inset-0 bg-slate-900/30"></div>

        <div className="absolute bottom-3 left-3 right-3 glass-card p-3 rounded-xl flex items-center gap-3 shadow-xs">
          <div className="bg-[#f26f21] p-2 rounded-lg text-white">
            <span className="material-symbols-outlined text-[20px]">location_on</span>
          </div>
          <div className="flex-1 truncate">
            <p className="text-xs font-bold text-[#0b1c30] truncate">{booking.campus}</p>
            <p className="text-[11px] text-slate-500 truncate">Bàn trực sảnh tự học Tòa nhà A (Cạnh Canteen)</p>
          </div>
        </div>
      </div>

      {/* 3. Service Breakdown Card */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/90 space-y-4">
        <h3 className="font-heading font-bold text-sm text-[#0b1c30]">Chi Tiết Dịch Vụ</h3>
        
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-[#f26f21]">
              <span className="material-symbols-outlined text-[20px]">headphones</span>
            </div>
            <div>
              <p className="font-bold text-xs text-[#0b1c30]">{booking.serviceName}</p>
              <p className="text-[11px] text-slate-500">Thiết bị: {booking.deviceModel}</p>
            </div>
          </div>
          <span className="font-black text-xs text-[#0b1c30]">
            {booking.amount.toLocaleString('vi-VN')}đ
          </span>
        </div>

        <div className="space-y-1.5 text-xs pt-1 text-slate-600">
          <div className="flex justify-between">
            <span className="text-slate-400">Khách hàng:</span>
            <span className="font-semibold text-slate-900">{booking.customerName} ({booking.phone})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Hình thức:</span>
            <span className="font-semibold text-slate-900">
              {booking.paymentMethod === 'VIETQR' ? 'Chuyển khoản SePay' : 'Tiền mặt tại trạm'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Trạng thái thanh toán:</span>
            <span className={`font-bold ${booking.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
              {booking.paymentStatus === 'PAID' ? 'Đã Thanh Toán' : 'Thanh Toán Khi Nhận Máy'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. QR Check-in Pass Card */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/90 text-center space-y-3">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          MÃ QR CHECK-IN TẠI TRẠM SẢNH FPT
        </span>

        <div className="flex justify-center py-1">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PODCYCLE_CHECKIN_${booking.bookingCode}`}
            alt="Checkin QR"
            className="w-36 h-36 rounded-xl border border-slate-200 shadow-2xs"
          />
        </div>

        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Đưa mã này cho kỹ thuật viên tại sảnh tự học để dán mã số niêm phong hộp sạc của bạn.
        </p>
      </div>

      {/* Back button */}
      <div className="text-center pt-2">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 underline"
        >
          Quay lại trang chủ
        </button>
      </div>

    </div>
  );
};
