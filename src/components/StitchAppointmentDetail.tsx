import React, { useState, useEffect } from 'react';
import { Booking } from '../types';
import { playStationNotification } from '../utils/sound';
import { trackEvent } from '../utils/analytics';
import { 
  getSePayPgConfig, 
  checkSePayPayment,
  getSePayApiToken,
  checkSePayPgOrderStatus,
  redirectToSePayCheckout
} from '../services/sepay';
import { DatabaseService } from '../services/db';

interface StitchAppointmentDetailProps {
  booking: Booking;
  onBack: () => void;
  onOpenReview: () => void;
  onConfirmPayment?: (bookingId: string) => void;
  onRefresh?: () => void;
}

export const StitchAppointmentDetail: React.FC<StitchAppointmentDetailProps> = ({
  booking,
  onBack,
  onOpenReview,
  onConfirmPayment,
  onRefresh
}) => {
  const pgConfig = getSePayPgConfig();
  const hasPgConfig = Boolean(pgConfig.merchant_id && pgConfig.secret_key);
  const sepayApiToken = getSePayApiToken();

  const [isManualChecking, setIsManualChecking] = useState(false);
  const [isAutoPolling, setIsAutoPolling] = useState(false);
  const [paymentSuccessNotice, setPaymentSuccessNotice] = useState(booking.paymentStatus === 'PAID');
  const [checkStatusMessage, setCheckStatusMessage] = useState<string>('');

  const isPaid = booking.paymentStatus === 'PAID' || paymentSuccessNotice;

  const handleConfirmPaymentSuccess = (source: string) => {
    if (paymentSuccessNotice || booking.paymentStatus === 'PAID') return;
    setPaymentSuccessNotice(true);
    playStationNotification('complete');

    // Ghi nhận giao dịch vào bảng transactions (Giai đoạn 2)
    DatabaseService.recordTransaction({
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      amount: booking.amount,
      paymentMethod: 'SEPAY_PG'
    });

    if (onConfirmPayment) {
      onConfirmPayment(booking.id);
    }
    if (onRefresh) {
      onRefresh();
    }
    trackEvent('purchase', {
      transaction_id: booking.bookingCode,
      value: booking.amount,
      currency: 'VND',
      payment_type: source
    });
  };

  // 1. Tự động kiểm tra callback redirect từ Cổng SePay Payment Gateway (?payment=success)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success' && !isPaid) {
      handleConfirmPaymentSuccess('SEPAY_PG_CALLBACK');
    }
  }, [isPaid]);

  // 2. Auto-polling kiểm tra thanh toán tự động qua Database (Webhook), SePay PG Order API & API Token v2
  useEffect(() => {
    if (isPaid) return;
    if (booking.paymentMethod !== 'VIETQR') return;

    let isMounted = true;
    let pollTimer: any = null;

    const poll = async () => {
      try {
        if (!isMounted) return;
        setIsAutoPolling(true);

        // A. Kiểm tra nhanh trực tiếp trong Supabase (được cập nhật ngay khi Webhook IPN kích hoạt)
        const freshBooking = await DatabaseService.getBookingByCode(booking.bookingCode);
        if (freshBooking && (freshBooking.paymentStatus === 'PAID' || freshBooking.status === 'CONFIRMED')) {
          if (isMounted) {
            handleConfirmPaymentSuccess('WEBHOOK_DB_SYNC');
            return;
          }
        }

        // B. Kiểm tra qua SePay PG Order API
        if (hasPgConfig) {
          const pgRes = await checkSePayPgOrderStatus(booking.bookingCode);
          if (pgRes.isPaid) {
            if (isMounted) handleConfirmPaymentSuccess('SEPAY_PG_ORDER_AUTO');
            return;
          }
        }

        // C. Kiểm tra qua SePay API v2 nếu có token
        if (sepayApiToken) {
          const result = await checkSePayPayment(booking.bookingCode, booking.amount);
          if (result.isPaid) {
            if (isMounted) handleConfirmPaymentSuccess('SEPAY_API_AUTO');
            return;
          }
        }
      } catch (err: any) {
        console.warn('[SePay Polling]', err.message);
      } finally {
        if (isMounted) setIsAutoPolling(false);
      }

      if (isMounted && !isPaid) {
        pollTimer = setTimeout(poll, 3000);
      }
    };

    pollTimer = setTimeout(poll, 2000);

    return () => {
      isMounted = false;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [isPaid, booking.paymentMethod, booking.bookingCode, booking.amount, hasPgConfig, sepayApiToken]);

  // 3. Nút kiểm tra thủ công trạng thái thanh toán
  const handleManualCheckPayment = async () => {
    setIsManualChecking(true);
    setCheckStatusMessage('Đang kết nối cổng SePay và cơ sở dữ liệu kiểm tra giao dịch...');

    try {
      // 1. Kiểm tra trực tiếp Database
      const freshBooking = await DatabaseService.getBookingByCode(booking.bookingCode);
      if (freshBooking && (freshBooking.paymentStatus === 'PAID' || freshBooking.status === 'CONFIRMED')) {
        handleConfirmPaymentSuccess('MANUAL_DB_CHECK');
        setCheckStatusMessage('');
        return;
      }

      // 2. Kiểm tra SePay PG Order API
      if (hasPgConfig) {
        const pgRes = await checkSePayPgOrderStatus(booking.bookingCode);
        if (pgRes.isPaid) {
          handleConfirmPaymentSuccess('SEPAY_PG_MANUAL');
          setCheckStatusMessage('');
          return;
        }
      }

      // 3. Kiểm tra SePay API v2
      if (sepayApiToken) {
        const res = await checkSePayPayment(booking.bookingCode, booking.amount);
        if (res.isPaid) {
          handleConfirmPaymentSuccess('SEPAY_TRANSACTION_MANUAL');
          setCheckStatusMessage('');
          return;
        }
      }

      setCheckStatusMessage(
        'Chưa ghi nhận thanh toán hoàn tất từ cổng SePay. Nếu bạn vừa chuyển khoản thành công, vui lòng chờ 3-5 giây để hệ thống đồng bộ.'
      );
    } catch (err: any) {
      setCheckStatusMessage('Lỗi kiểm tra SePay: ' + (err.message || 'Lỗi kết nối'));
    } finally {
      setIsManualChecking(false);
    }
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

      {/* 1. Status & ID Card */}
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
              {booking.status === 'PENDING' ? 'Chờ Bàn Giao' : booking.status === 'CLEANING' ? 'Đang Vệ Sinh 30p' : 'Đã Tiếp Nhận'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
          <span className="material-symbols-outlined text-[18px] text-[#f26f21]">calendar_month</span>
          <span className="font-semibold text-slate-900">{booking.bookingDate} — {booking.slotTime}</span>
        </div>
      </div>

      {/* 2. Map Snippet Card */}
      <div className="relative w-full h-40 rounded-2xl overflow-hidden shadow-xs border border-slate-200 group">
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
              {booking.paymentMethod === 'VIETQR' ? 'Cổng thanh toán SePay (Bên Thứ 3)' : 'Tiền mặt tại trạm'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Trạng thái thanh toán:</span>
            <span className={`font-bold ${isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
              {isPaid ? 'Đã Thanh Toán Thành Công' : 'Chờ Thanh Toán Qua Cổng SePay / Tiền Mặt'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. CỔNG THANH TOÁN BÊN THỨ 3: SEPAY PAYMENT GATEWAY (PRODUCTION 100%) */}
      {booking.paymentMethod === 'VIETQR' && (
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/90 space-y-4">
          
          {/* Status Header */}
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#f26f21] text-[20px]">verified_user</span>
              <div>
                <h3 className="font-heading font-bold text-sm text-[#0b1c30]">
                  Cổng Thanh Toán SePay (Bên Thứ 3)
                </h3>
                <span className="text-[10px] text-slate-400">Giao dịch được bảo mật và đối soát trực tiếp qua SePay</span>
              </div>
            </div>

            {isPaid ? (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-300">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                <span>ĐÃ THANH TOÁN</span>
              </span>
            ) : (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                <span>CHỜ THANH TOÁN</span>
              </span>
            )}
          </div>

          {!isPaid ? (
            <div className="space-y-4">
              
              {/* Box Thanh Toán Qua SePay Gateway (Full-page Redirect) */}
              <div className="bg-gradient-to-br from-orange-50/90 via-white to-amber-50/60 p-5 rounded-2xl border border-orange-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#f26f21] flex items-center justify-center shrink-0 shadow-2xs">
                      <span className="material-symbols-outlined text-[26px]">account_balance_wallet</span>
                    </div>
                    <div>
                      <h4 className="font-heading font-extrabold text-sm text-[#0b1c30]">Đơn Hàng Chờ Thanh Toán</h4>
                      <p className="text-[11px] text-slate-500">
                        Mã đơn: <strong className="text-slate-800">{booking.bookingCode}</strong> • Cần thanh toán: <strong className="text-[#f26f21]">{booking.amount.toLocaleString('vi-VN')}đ</strong>
                      </p>
                    </div>
                  </div>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-amber-300 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    <span>CHỜ THANH TOÁN</span>
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Cổng thanh toán:</span>
                    <span className="font-semibold text-slate-900">SePay Gateway (VietQR Napas 24/7)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Mã đơn đối soát:</span>
                    <span className="font-bold text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded">{booking.bookingCode}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Trạng thái vé QR:</span>
                    <span className="text-amber-700 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">lock</span>
                      <span>Khóa (mở tự động sau khi thanh toán)</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
                    💡 Bấm nút bên dưới để chuyển tiếp sang Cổng SePay chính thức toàn màn hình để quét mã VietQR hoặc mở App ngân hàng 1-chạm. Sau khi thanh toán, hệ thống sẽ tự động đưa bạn về vé hẹn.
                  </p>
                </div>

                {/* Nút bấm chuyển hướng sang SePay toàn màn hình */}
                <button
                  type="button"
                  onClick={() => {
                    try {
                      redirectToSePayCheckout({
                        bookingCode: booking.bookingCode,
                        amount: booking.amount,
                        description: `PODCYCLE ${booking.bookingCode}`,
                        customerId: booking.studentId || booking.phone
                      });
                    } catch (err: any) {
                      alert(err.message || 'Lỗi kết nối cổng SePay');
                    }
                  }}
                  className="w-full fpt-gradient fpt-gradient-hover text-white font-bold text-sm py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[20px]">payments</span>
                  <span>Thanh Toán Ngay Qua Cổng SePay</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>

                {/* Status Message */}
                {checkStatusMessage && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-amber-600 shrink-0">info</span>
                    <span className="flex-1">{checkStatusMessage}</span>
                  </div>
                )}

                {/* Realtime Auto-Polling Pulse Indicator & Manual Check */}
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isAutoPolling ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
                    <span>
                      {isAutoPolling
                        ? 'Đang tự động đồng bộ kết quả từ SePay...'
                        : 'Hệ thống tự động phát hiện khi thanh toán thành công'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleManualCheckPayment}
                    disabled={isManualChecking}
                    className="text-slate-700 hover:text-slate-900 font-bold underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {isManualChecking ? 'Đang kiểm tra...' : 'Kiểm tra ngay'}
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* PAID SUCCESS BANNER */
            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-center space-y-2 text-xs text-emerald-900 animate-in fade-in">
              <span className="material-symbols-outlined text-emerald-600 text-[36px] mx-auto block">
                task_alt
              </span>
              <p className="font-heading font-extrabold text-sm text-emerald-800">
                SePay Gateway: Đã Ghi Nhận Thanh Toán Thành Công!
              </p>
              <div className="text-slate-600 space-y-0.5 text-[11px] pt-1 border-t border-emerald-200/70">
                <p>
                  Mã đơn hàng: <strong className="font-mono text-slate-800">{booking.bookingCode}</strong>
                </p>
                <p>
                  Số tiền thanh toán: <strong className="text-emerald-700">{booking.amount.toLocaleString('vi-VN')}đ</strong>
                </p>
                <p className="text-[10px] text-slate-500">
                  Giao dịch được xác thực an toàn qua Cổng SePay Payment Gateway Production.
                </p>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 5. THẺ VÉ HẸN ĐIỆN TỬ O2O (DIGITAL APPOINTMENT PASS - GIAI ĐOẠN 2 & 3) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 relative overflow-hidden space-y-4">
        
        {/* Ticket Header */}
        <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-orange-100 text-[#f26f21] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
            </span>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                FPT O2O STATION PASS
              </span>
              <h3 className="font-heading font-extrabold text-sm text-[#0b1c30]">
                VÉ HẸN ĐIỆN TỬ BÀN GIAO AIRPODS
              </h3>
            </div>
          </div>

          <div className="text-right">
            {isPaid ? (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">verified</span>
                <span>VÉ HỢP LỆ</span>
              </span>
            ) : (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-300">
                CHỜ THANH TOÁN
              </span>
            )}
          </div>
        </div>

        {/* Mã QR Định Danh Vé Hẹn - CHỈ KÍCH HOẠT KHI ĐÃ THANH TOÁN THÀNH CÔNG */}
        {isPaid ? (
          <div className="flex flex-col sm:flex-row items-center gap-5 bg-gradient-to-br from-emerald-50/60 to-orange-50/40 p-4 rounded-2xl border border-emerald-200/80">
            <div className="bg-white p-2.5 rounded-2xl border-2 border-dashed border-emerald-500 shadow-sm shrink-0 flex flex-col items-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(booking.bookingCode)}`}
                alt={`QR Code Pass ${booking.bookingCode}`}
                className="w-36 h-36 object-contain rounded-lg"
                loading="lazy"
              />
              <span className="font-mono font-black text-sm text-emerald-800 mt-1.5 tracking-wider">
                {booking.bookingCode}
              </span>
            </div>

            <div className="space-y-2 text-xs flex-1 text-center sm:text-left">
              <p className="font-bold text-emerald-800 text-sm flex items-center justify-center sm:justify-start gap-1">
                <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
                <span>Vé Hẹn Đã Kích Hoạt • Đưa Mã Này Cho KTV</span>
              </p>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Kỹ thuật viên tại bàn trực Sảnh Tòa Nhà A sẽ dùng camera quét mã QR này để <strong>Check-in</strong> và cùng bạn thực hiện <strong>Đồng kiểm lâm sàng màng loa</strong> trước khi nhận máy.
              </p>
              <div className="pt-1.5 border-t border-slate-200/60 text-[11px] text-slate-500 space-y-1">
                <p>📍 <strong>Địa điểm:</strong> Bàn trực sảnh tự học Tòa nhà A (Cạnh Canteen)</p>
                <p>⏰ <strong>Khung giờ:</strong> {booking.bookingDate} ({booking.slotTime})</p>
                <p>🎧 <strong>Thiết bị:</strong> {booking.deviceModel} • {booking.customerName}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center border border-amber-300 shadow-xs">
              <span className="material-symbols-outlined text-[28px]">lock</span>
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-amber-900">Mã QR Check-in Đang Tạm Khóa</h4>
              <p className="text-xs text-amber-700/90 mt-1 max-w-md mx-auto">
                Theo quy chuẩn SOP trạm O2O Station, Vé Hẹn Điện Tử & Mã QR Check-in chỉ được phát hành sau khi đơn hàng được ghi nhận thanh toán qua Cổng SePay.
              </p>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">
              👉 Vui lòng quét mã VietQR phía trên để thanh toán và kích hoạt Vé Hẹn Điện Tử.
            </p>
          </div>
        )}

        {/* 6-Stage SOP Progress Tracker */}
        <div className="space-y-2 pt-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Tiến trình xử lý 6 giai đoạn chuẩn:
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center text-[10px]">
            <div className={`p-2 rounded-xl border ${isPaid ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              <span className="block text-[14px]">✓</span>
              <span>1. Đặt & TT</span>
            </div>
            <div className={`p-2 rounded-xl border ${booking.status === 'CHECKED_IN' || booking.status === 'PROCESSING' || booking.status === 'CLEANING' || booking.status === 'READY_FOR_PICKUP' || booking.status === 'READY' || booking.status === 'COMPLETED' ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : isPaid ? 'bg-orange-50 border-orange-300 text-orange-800 font-bold animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              <span className="block text-[14px]">📍</span>
              <span>2. Tới sảnh</span>
            </div>
            <div className={`p-2 rounded-xl border ${booking.status === 'CHECKED_IN' ? 'bg-blue-50 border-blue-300 text-blue-800 font-bold animate-pulse' : booking.status === 'PROCESSING' || booking.status === 'CLEANING' || booking.status === 'READY_FOR_PICKUP' || booking.status === 'READY' || booking.status === 'COMPLETED' ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              <span className="block text-[14px]">🔍</span>
              <span>3. Đồng kiểm</span>
            </div>
            <div className={`p-2 rounded-xl border ${booking.status === 'PROCESSING' || booking.status === 'CLEANING' ? 'bg-purple-50 border-purple-300 text-purple-800 font-bold animate-pulse' : booking.status === 'READY_FOR_PICKUP' || booking.status === 'READY' || booking.status === 'COMPLETED' ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              <span className="block text-[14px]">⚡</span>
              <span>4. Vệ sinh 30p</span>
            </div>
            <div className={`p-2 rounded-xl border ${booking.status === 'READY_FOR_PICKUP' || booking.status === 'READY' ? 'bg-blue-50 border-blue-300 text-blue-800 font-bold animate-pulse' : booking.status === 'COMPLETED' ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              <span className="block text-[14px]">🎧</span>
              <span>5. Test âm</span>
            </div>
            <div className={`p-2 rounded-xl border ${booking.status === 'COMPLETED' ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold ring-2 ring-emerald-500/20' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              <span className="block text-[14px]">★</span>
              <span>6. Hoàn tất</span>
            </div>
          </div>
        </div>

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
