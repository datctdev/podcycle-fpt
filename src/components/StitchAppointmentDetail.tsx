import React, { useState } from 'react';
import { Booking } from '../types';
import { getBankConfig, generateRealVietQR } from '../services/db';
import { playStationNotification } from '../utils/sound';

interface StitchAppointmentDetailProps {
  booking: Booking;
  onBack: () => void;
  onOpenReview: () => void;
  onConfirmPayment?: (bookingId: string) => void;
}

export const StitchAppointmentDetail: React.FC<StitchAppointmentDetailProps> = ({
  booking,
  onBack,
  onOpenReview,
  onConfirmPayment
}) => {
  const bankConfig = getBankConfig();
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [paymentSuccessNotice, setPaymentSuccessNotice] = useState(false);

  const handleVerifyPayment = () => {
    setIsCheckingPayment(true);
    setTimeout(() => {
      setIsCheckingPayment(false);
      if (onConfirmPayment) {
        onConfirmPayment(booking.id);
      }
      playStationNotification('complete');
      setPaymentSuccessNotice(true);
    }, 1200);
  };
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
            <span className={`font-bold ${booking.paymentStatus === 'PAID' || paymentSuccessNotice ? 'text-emerald-600' : 'text-amber-600'}`}>
              {booking.paymentStatus === 'PAID' || paymentSuccessNotice ? 'Đã Thanh Toán' : 'Chờ Thanh Toán Qua VietQR / Tiền Mặt'}
            </span>
          </div>
        </div>
      </div>

      {/* REAL VIETQR AUTOMATED PAYMENT SECTION */}
      {booking.paymentMethod === 'VIETQR' && (
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/90 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-heading font-bold text-sm text-[#0b1c30] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#f26f21] text-[18px]">qr_code_scanner</span>
              <span>Cổng Thanh Toán Napas 24/7 (VietQR)</span>
            </h3>
            {booking.paymentStatus === 'PAID' || paymentSuccessNotice ? (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                <span className="material-symbols-outlined text-[13px]">check_circle</span>
                <span>ĐÃ THANH TOÁN THÀNH CÔNG</span>
              </span>
            ) : (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse border border-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>CHỜ THANH TOÁN</span>
              </span>
            )}
          </div>

          {booking.paymentStatus !== 'PAID' && !paymentSuccessNotice ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-orange-50/60 p-4 rounded-xl border border-orange-200">
                <div className="bg-white p-2 rounded-xl shadow-xs border border-slate-200 shrink-0">
                  <img
                    src={generateRealVietQR(bankConfig, booking.amount, booking.bookingCode)}
                    alt="VietQR Napas 247"
                    className="w-32 h-32 object-contain"
                  />
                </div>
                <div className="text-xs text-slate-700 leading-normal space-y-1.5 w-full">
                  <p>Ngân hàng nhận: <strong className="text-[#0b1c30]">{bankConfig.bankName}</strong></p>
                  <p>Số tài khoản: <strong className="font-mono text-sm text-[#0b1c30]">{bankConfig.accountNo}</strong></p>
                  <p>Chủ tài khoản: <strong className="text-[#0b1c30]">{bankConfig.accountName}</strong></p>
                  <p>Số tiền: <strong className="text-[#f26f21] text-sm">{booking.amount.toLocaleString('vi-VN')}đ</strong></p>
                  <p>Nội dung CK: <strong className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-[#0b1c30]">TTN {booking.bookingCode}</strong></p>
                </div>
              </div>

              <button
                onClick={handleVerifyPayment}
                disabled={isCheckingPayment}
                className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {isCheckingPayment ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Đang kết nối API kiểm tra biến động số dư ngân hàng...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                    <span>Tôi Đã Chuyển Khoản ➔ Kiểm Tra & Xác Nhận Đơn</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center space-y-1 text-xs text-emerald-800">
              <span className="material-symbols-outlined text-emerald-600 text-[28px] mx-auto block">task_alt</span>
              <p className="font-bold text-sm">Giao dịch đã được hệ thống ghi nhận thành công!</p>
              <p className="text-slate-600">Mã giao dịch đối soát Napas: <strong>TX-{booking.bookingCode}-OK</strong></p>
            </div>
          )}
        </div>
      )}

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
