import React, { useState, useEffect } from 'react';
import { Booking } from '../types';
import { playStationNotification } from '../utils/sound';
import { trackEvent } from '../utils/analytics';
import { 
  SePayPgClient, 
  getSePayPgConfig, 
  checkSePayPayment,
  getSePayApiToken,
  checkSePayPgOrderStatus
} from '../services/sepay';

interface StitchAppointmentDetailProps {
  booking: Booking;
  onBack: () => void;
  onOpenReview: () => void;
  onConfirmPayment?: (bookingId: string) => void;
  onOpenSettings?: () => void;
}

export const StitchAppointmentDetail: React.FC<StitchAppointmentDetailProps> = ({
  booking,
  onBack,
  onOpenReview,
  onConfirmPayment,
  onOpenSettings
}) => {
  const pgConfig = getSePayPgConfig();
  const hasPgConfig = Boolean(pgConfig.merchant_id && pgConfig.secret_key);
  const sepayApiToken = getSePayApiToken();

  const [isManualChecking, setIsManualChecking] = useState(false);
  const [isAutoPolling, setIsAutoPolling] = useState(false);
  const [paymentSuccessNotice, setPaymentSuccessNotice] = useState(booking.paymentStatus === 'PAID');
  const [checkStatusMessage, setCheckStatusMessage] = useState<string>('');
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const iframeFormRef = React.useRef<HTMLFormElement>(null);
  const newTabFormRef = React.useRef<HTMLFormElement>(null);

  const isPaid = booking.paymentStatus === 'PAID' || paymentSuccessNotice;

  // Khởi tạo SePay Payment Gateway Form Fields (chuẩn Production)
  const pgClient = new SePayPgClient(pgConfig);
  const checkoutURL = pgClient.checkout.initCheckoutUrl();
  const checkoutFormfields = hasPgConfig ? pgClient.checkout.initOneTimePaymentFields({
    payment_method: 'BANK_TRANSFER',
    order_invoice_number: booking.bookingCode,
    order_amount: booking.amount,
    currency: 'VND',
    order_description: `Thanh toan don hang ${booking.bookingCode}`,
    success_url: `${window.location.origin}/?payment=success&code=${booking.bookingCode}`,
    error_url: `${window.location.origin}/?payment=error&code=${booking.bookingCode}`,
    cancel_url: `${window.location.origin}/?payment=cancel&code=${booking.bookingCode}`,
  }) : null;

  const handleConfirmPaymentSuccess = (source: string) => {
    if (paymentSuccessNotice || booking.paymentStatus === 'PAID') return;
    setPaymentSuccessNotice(true);
    playStationNotification('complete');
    if (onConfirmPayment) {
      onConfirmPayment(booking.id);
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

  // 2. Tự động nạp Cổng Thanh Toán SePay & Mã QR vào iframe
  useEffect(() => {
    if (!isPaid && hasPgConfig && checkoutFormfields && iframeFormRef.current) {
      const timer = setTimeout(() => {
        try {
          iframeFormRef.current?.submit();
          setIframeLoaded(true);
        } catch (err) {
          console.error('[SePay Iframe] Submit error:', err);
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isPaid, hasPgConfig, booking.bookingCode]);

  // 3. Auto-polling kiểm tra thanh toán tự động qua SePay PG Order API & API Token v2
  useEffect(() => {
    if (isPaid) return;
    if (booking.paymentMethod !== 'VIETQR') return;
    if (!hasPgConfig && !sepayApiToken) return;

    let isMounted = true;
    let pollTimer: any = null;

    const poll = async () => {
      try {
        if (!isMounted) return;
        setIsAutoPolling(true);

        // A. Kiểm tra trực tiếp qua SePay PG Order API
        if (hasPgConfig) {
          const pgRes = await checkSePayPgOrderStatus(booking.bookingCode);
          if (pgRes.isPaid) {
            if (isMounted) handleConfirmPaymentSuccess('SEPAY_PG_ORDER_AUTO');
            return;
          }
        }

        // B. Kiểm tra qua SePay API v2 nếu có token
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
        pollTimer = setTimeout(poll, 4000);
      }
    };

    pollTimer = setTimeout(poll, 3000);

    return () => {
      isMounted = false;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [isPaid, booking.paymentMethod, booking.bookingCode, booking.amount, hasPgConfig, sepayApiToken]);

  // 4. Nút kiểm tra thủ công SePay
  const handleManualCheckPayment = async () => {
    if (!hasPgConfig && !sepayApiToken) {
      setCheckStatusMessage('Chưa cấu hình SePay Merchant ID hoặc API Token! Vui lòng bấm vào icon Bánh Răng để thêm cấu hình.');
      if (onOpenSettings) onOpenSettings();
      return;
    }

    setIsManualChecking(true);
    setCheckStatusMessage('Đang kết nối SePay Gateway kiểm tra trạng thái thanh toán...');

    try {
      if (hasPgConfig) {
        const pgRes = await checkSePayPgOrderStatus(booking.bookingCode);
        if (pgRes.isPaid) {
          handleConfirmPaymentSuccess('SEPAY_PG_MANUAL');
          setCheckStatusMessage('');
          return;
        }
      }

      if (sepayApiToken) {
        const res = await checkSePayPayment(booking.bookingCode, booking.amount);
        if (res.isPaid) {
          handleConfirmPaymentSuccess('SEPAY_TRANSACTION_MANUAL');
          setCheckStatusMessage('');
          return;
        }
      }
      
      setCheckStatusMessage(
        'Chưa ghi nhận thanh toán hoàn tất từ cổng SePay. Nếu bạn đã chuyển khoản thành công, vui lòng chờ 5-10 giây để cổng đồng bộ dữ liệu.'
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
              
              {/* Box Thanh Toán Qua SePay Gateway với Mã QR Trực Tiếp */}
              <div className="bg-orange-50/70 p-4 rounded-2xl border border-orange-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#f26f21] text-[24px]">qr_code_2</span>
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#0b1c30]">Mã QR Cổng Thanh Toán SePay (Live)</p>
                      <p className="text-slate-500 text-[11px]">
                        Mã đơn: <span className="font-bold text-slate-800">{booking.bookingCode}</span> • Số tiền: <span className="font-bold text-[#f26f21]">{booking.amount.toLocaleString('vi-VN')}đ</span>
                      </p>
                    </div>
                  </div>

                  {hasPgConfig && checkoutFormfields && (
                    <button
                      type="button"
                      onClick={() => newTabFormRef.current?.submit()}
                      className="text-[11px] font-bold text-[#f26f21] hover:text-orange-700 bg-white border border-orange-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                      title="Mở cổng SePay trong tab mới"
                    >
                      <span>Mở tab mới</span>
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </button>
                  )}
                </div>

                {/* Các Form POST ẩn gửi dữ liệu bảo mật sang SePay PG */}
                {hasPgConfig && checkoutFormfields ? (
                  <>
                    <form
                      ref={iframeFormRef}
                      action={checkoutURL}
                      method="POST"
                      target="sepay_checkout_frame"
                      className="hidden"
                    >
                      {Object.keys(checkoutFormfields).map((field) => (
                        <input
                          key={field}
                          type="hidden"
                          name={field}
                          value={checkoutFormfields[field]}
                        />
                      ))}
                    </form>

                    <form
                      ref={newTabFormRef}
                      action={checkoutURL}
                      method="POST"
                      target="_blank"
                      className="hidden"
                    >
                      {Object.keys(checkoutFormfields).map((field) => (
                        <input
                          key={field}
                          type="hidden"
                          name={field}
                          value={checkoutFormfields[field]}
                        />
                      ))}
                    </form>

                    {/* Khung nhúng Cổng Thanh Toán SePay - Tự động hiển thị Mã QR VietQR Napas 24/7 */}
                    <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs">
                      {!iframeLoaded && (
                        <div className="h-[460px] flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-50">
                          <div className="w-8 h-8 border-3 border-[#f26f21] border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-xs font-semibold text-slate-700">Đang khởi tạo mã QR từ Cổng Thanh Toán SePay Live...</p>
                          <button
                            type="button"
                            onClick={() => {
                              iframeFormRef.current?.submit();
                              setIframeLoaded(true);
                            }}
                            className="text-xs bg-white border border-slate-300 px-3 py-1.5 rounded-lg font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                          >
                            Bấm để nạp lại mã QR
                          </button>
                        </div>
                      )}
                      
                      <iframe
                        name="sepay_checkout_frame"
                        id="sepay_checkout_frame"
                        title="Cổng Thanh Toán SePay"
                        className={`w-full h-[520px] border-0 transition-opacity duration-300 ${iframeLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
                        onLoad={() => setIframeLoaded(true)}
                      />
                    </div>

                    {/* Hàng nút bấm hành động */}
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          iframeFormRef.current?.submit();
                          setIframeLoaded(true);
                        }}
                        className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[16px]">refresh</span>
                        <span>Tải lại mã QR</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => newTabFormRef.current?.submit()}
                        className="flex-1 fpt-gradient fpt-gradient-hover text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                        <span>Mở Cổng SePay Toàn Màn Hình</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                    Chưa cấu hình SePay Merchant ID & Secret Key trong file .env hoặc Cài đặt.
                  </div>
                )}
              </div>

              {/* Status Message */}
              {checkStatusMessage && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-amber-600 shrink-0">info</span>
                  <span className="flex-1">{checkStatusMessage}</span>
                </div>
              )}

              {/* Realtime Auto-Polling Pulse Indicator (Nếu có token) */}
              {sepayApiToken && (
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isAutoPolling ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
                    <span>
                      {isAutoPolling
                        ? 'SePay đang rà soát biến động giao dịch tự động...'
                        : 'Hệ thống tự động phát hiện khi cổng thanh toán hoàn tất'}
                    </span>
                  </div>
                </div>
              )}

              {/* Manual Check Button */}
              <button
                onClick={handleManualCheckPayment}
                disabled={isManualChecking}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-75"
              >
                {isManualChecking ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Đang kiểm tra từ Cổng SePay...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">sync</span>
                    <span>Tôi Đã Hoàn Tất Thanh Toán ➔ Kiểm Tra Ngay</span>
                  </>
                )}
              </button>

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

      {/* 5. QR Check-in Pass Card */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/90 text-center space-y-3">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          MÃ CHECK-IN TẠI TRẠM SẢNH FPT
        </span>

        <div className="flex justify-center py-1">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
            <span className="font-mono font-extrabold text-2xl text-slate-900 tracking-wider block">
              {booking.bookingCode}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Đọc mã này cho kỹ thuật viên tại sảnh tự học để dán mã số niêm phong hộp sạc
            </span>
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
