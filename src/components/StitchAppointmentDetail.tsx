import React, { useState, useEffect } from 'react';
import { Booking } from '../types';
import { playStationNotification } from '../utils/sound';
import { trackEvent } from '../utils/analytics';
import { 
  getSePayConfig, 
  generateSePayQRUrl, 
  checkSePayPayment, 
  getTransferSyntax, 
  SePayTransaction,
  SePayPgClient,
  getSePayPgConfig
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
  const sepayConfig = getSePayConfig();
  const pgConfig = getSePayPgConfig();
  const hasPgConfig = Boolean(pgConfig.merchant_id && pgConfig.secret_key);

  const [isManualChecking, setIsManualChecking] = useState(false);
  const [isAutoPolling, setIsAutoPolling] = useState(false);
  const [paymentSuccessNotice, setPaymentSuccessNotice] = useState(booking.paymentStatus === 'PAID');
  const [matchedTx, setMatchedTx] = useState<SePayTransaction | null>(null);
  const [checkStatusMessage, setCheckStatusMessage] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const transferSyntax = getTransferSyntax(booking.bookingCode);
  const qrUrl = generateSePayQRUrl(booking.amount, booking.bookingCode, sepayConfig);

  // Khởi tạo SePay Payment Gateway Form Fields (theo đúng mẫu SePay cung cấp)
  const pgClient = new SePayPgClient(pgConfig);
  const checkoutURL = pgClient.checkout.initCheckoutUrl();
  const checkoutFormfields = hasPgConfig ? pgClient.checkout.initOneTimePaymentFields({
    payment_method: 'BANK_TRANSFER',
    order_invoice_number: booking.bookingCode,
    order_amount: booking.amount,
    currency: 'VND',
    order_description: `Thanh toan don hang ${booking.bookingCode}`,
    success_url: `${window.location.origin}/detail/${booking.bookingCode}?payment=success`,
    error_url: `${window.location.origin}/detail/${booking.bookingCode}?payment=error`,
    cancel_url: `${window.location.origin}/detail/${booking.bookingCode}?payment=cancel`,
  }) : null;

  // Copy to clipboard helper
  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // 1. Tự động kiểm tra callback từ SePay Payment Gateway (URL có ?payment=success)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success' && booking.paymentStatus !== 'PAID' && !paymentSuccessNotice) {
      setPaymentSuccessNotice(true);
      playStationNotification('complete');
      if (onConfirmPayment) {
        onConfirmPayment(booking.id);
      }
      trackEvent('purchase', {
        transaction_id: booking.bookingCode,
        value: booking.amount,
        currency: 'VND',
        payment_type: 'SEPAY_GATEWAY_SUCCESS'
      });
    }
  }, [booking.id, booking.bookingCode, booking.amount, booking.paymentStatus, paymentSuccessNotice]);

  // 2. AUTO-POLLING SEPAY API V2: Kiểm tra tự động mỗi 3.5 giây khi chưa thanh toán
  useEffect(() => {
    if (booking.paymentStatus === 'PAID' || paymentSuccessNotice) return;
    if (booking.paymentMethod !== 'VIETQR') return;
    if (!sepayConfig.apiKey) {
      return;
    }

    let isMounted = true;
    let pollTimer: any = null;

    const poll = async () => {
      try {
        if (!isMounted) return;
        setIsAutoPolling(true);
        const result = await checkSePayPayment(booking.bookingCode, booking.amount);
        
        if (!isMounted) return;
        if (result.isPaid && result.transaction) {
          setMatchedTx(result.transaction);
          setPaymentSuccessNotice(true);
          playStationNotification('complete');
          
          if (onConfirmPayment) {
            onConfirmPayment(booking.id);
          }

          // Track GA4 purchase completion
          trackEvent('purchase', {
            transaction_id: result.transaction.reference_number || booking.bookingCode,
            value: booking.amount,
            currency: 'VND',
            payment_type: 'SEPAY_VIETQR'
          });

          return; // Stop polling
        }
      } catch (err: any) {
        console.warn('[SePay Polling Notice]', err.message);
      } finally {
        if (isMounted) setIsAutoPolling(false);
      }

      if (isMounted && !paymentSuccessNotice && booking.paymentStatus !== 'PAID') {
        pollTimer = setTimeout(poll, 3500);
      }
    };

    pollTimer = setTimeout(poll, 1500);

    return () => {
      isMounted = false;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [booking.id, booking.paymentStatus, booking.bookingCode, booking.amount, booking.paymentMethod, paymentSuccessNotice, sepayConfig.apiKey]);

  // 3. Nút kiểm tra thủ công SePay
  const handleManualCheckPayment = async () => {
    if (!sepayConfig.apiKey && !hasPgConfig) {
      setCheckStatusMessage('Chưa cấu hình SePay API Key hoặc Merchant ID! Vui lòng bấm vào icon Bánh Răng để thêm cấu hình.');
      if (onOpenSettings) onOpenSettings();
      return;
    }

    setIsManualChecking(true);
    setCheckStatusMessage('Đang kết nối SePay rà soát biến động số dư ngân hàng...');

    try {
      const res = await checkSePayPayment(booking.bookingCode, booking.amount);
      if (res.isPaid && res.transaction) {
        setMatchedTx(res.transaction);
        setPaymentSuccessNotice(true);
        playStationNotification('complete');
        if (onConfirmPayment) {
          onConfirmPayment(booking.id);
        }
        setCheckStatusMessage('');
      } else {
        setCheckStatusMessage(
          res.message || 'Chưa ghi nhận biến động số dư cho đơn này. Thông thường ngân hàng mất 5-15 giây để báo tin. Hệ thống đang tiếp tục auto-polling!'
        );
      }
    } catch (err: any) {
      setCheckStatusMessage('Lỗi kiểm tra SePay: ' + (err.message || 'Lỗi mạng'));
    } finally {
      setIsManualChecking(false);
    }
  };

  const isPaid = booking.paymentStatus === 'PAID' || paymentSuccessNotice;

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
              {booking.paymentMethod === 'VIETQR' ? 'Chuyển khoản SePay (Napas 24/7)' : 'Tiền mặt tại trạm'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Trạng thái thanh toán:</span>
            <span className={`font-bold ${isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
              {isPaid ? 'Đã Thanh Toán Thành Công' : 'Chờ Thanh Toán Qua SePay / Tiền Mặt'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. REAL SEPAY AUTOMATED PAYMENT SECTION (MÃ QR ĐƯỢC TẠO SAU KHI ĐẶT LỊCH) */}
      {booking.paymentMethod === 'VIETQR' && (
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/90 space-y-4">
          
          {/* Status Header */}
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#f26f21] text-[20px]">qr_code_scanner</span>
              <div>
                <h3 className="font-heading font-bold text-sm text-[#0b1c30]">
                  Cổng Thanh Toán SePay (Đã Kích Hoạt Cho Đơn Hàng)
                </h3>
                <span className="text-[10px] text-slate-400">Mã QR động tạo riêng cho đơn {booking.bookingCode}</span>
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
                <span>CHỜ QUÉT MÃ QR</span>
              </span>
            )}
          </div>

          {/* Payment Details */}
          {!isPaid ? (
            <div className="space-y-4">
              
              {/* CÁCH 1: QUÉT MÃ QR ĐỘNG SEPAY NAPAS 24/7 TẠI CHỖ */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-orange-50/70 p-4 rounded-2xl border border-orange-200">
                
                {/* QR Code động cho đơn hàng này */}
                <div className="bg-white p-2.5 rounded-2xl shadow-xs border border-slate-200 shrink-0 flex flex-col items-center">
                  <img
                    src={qrUrl}
                    alt="SePay VietQR Napas 247"
                    className="w-36 h-36 object-contain rounded-lg"
                  />
                  <span className="text-[10px] text-slate-400 font-semibold mt-1">Mở App Ngân Hàng Quét</span>
                </div>

                {/* Account Details & Quick Copy */}
                <div className="text-xs text-slate-700 leading-normal space-y-2 w-full">
                  
                  {/* Ngân hàng */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Ngân hàng nhận:</span>
                    <strong className="text-[#0b1c30]">{sepayConfig.bank}</strong>
                  </div>

                  {/* STK */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Số tài khoản:</span>
                    <div className="flex items-center gap-1.5">
                      <strong className="font-mono text-sm text-[#0b1c30]">{sepayConfig.accountNo}</strong>
                      <button
                        onClick={() => handleCopy('acc', sepayConfig.accountNo)}
                        className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors"
                        title="Sao chép STK"
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {copiedKey === 'acc' ? 'check' : 'content_copy'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Chủ TK */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Chủ tài khoản:</span>
                    <strong className="text-[#0b1c30]">{sepayConfig.accountName}</strong>
                  </div>

                  {/* Số tiền */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Số tiền:</span>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-[#f26f21] text-sm">{booking.amount.toLocaleString('vi-VN')}đ</strong>
                      <button
                        onClick={() => handleCopy('amount', String(booking.amount))}
                        className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors"
                        title="Sao chép số tiền"
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {copiedKey === 'amount' ? 'check' : 'content_copy'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Cú pháp chuyển khoản */}
                  <div className="flex justify-between items-center pt-1 border-t border-orange-200/80">
                    <span className="text-slate-600 font-bold">Nội dung CK:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-orange-300 text-[#0b1c30]">
                        {transferSyntax}
                      </span>
                      <button
                        onClick={() => handleCopy('content', transferSyntax)}
                        className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors"
                        title="Sao chép nội dung"
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {copiedKey === 'content' ? 'check' : 'content_copy'}
                        </span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* CÁCH 2: FORM POST CỔNG THANH TOÁN SEPAY PAYMENT GATEWAY (MERCHANT ID & SECRET KEY) */}
              {hasPgConfig && checkoutFormfields && (
                <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-950 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-blue-600 text-[18px]">verified</span>
                      <span>Hoặc Thanh Toán Qua Cổng SePay Payment Gateway:</span>
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                      {pgConfig.env.toUpperCase()}
                    </span>
                  </div>

                  <form action={checkoutURL} method="POST" target="_blank" className="w-full">
                    {Object.keys(checkoutFormfields).map((field) => (
                      <input
                        key={field}
                        type="hidden"
                        name={field}
                        value={checkoutFormfields[field]}
                      />
                    ))}
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[17px]">open_in_new</span>
                      <span>Mở Cổng Thanh Toán SePay (Pay Now)</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Realtime Auto-Polling Pulse Indicator */}
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isAutoPolling ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
                  <span>
                    {isAutoPolling
                      ? 'SePay đang rà soát biến động số dư ngân hàng tự động...'
                      : 'Hệ thống tự động phát hiện khi tài khoản nhận được tiền'}
                  </span>
                </div>
                {onOpenSettings && (
                  <button
                    onClick={onOpenSettings}
                    className="text-[#f26f21] hover:underline font-bold text-[10px]"
                  >
                    Cài đặt SePay Key
                  </button>
                )}
              </div>

              {/* Status Message */}
              {checkStatusMessage && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-amber-600 shrink-0">info</span>
                  <span className="flex-1">{checkStatusMessage}</span>
                </div>
              )}

              {/* Manual Check Button */}
              <button
                onClick={handleManualCheckPayment}
                disabled={isManualChecking}
                className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-75"
              >
                {isManualChecking ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Đang gọi SePay API đối soát sao kê...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                    <span>Tôi Đã Chuyển Khoản ➔ Kiểm Tra Biến Động Ngay</span>
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
                SePay: Đã Ghi Nhận Thanh Toán Chuyển Khoản Thành Công!
              </p>
              <div className="text-slate-600 space-y-0.5 text-[11px] pt-1 border-t border-emerald-200/70">
                <p>
                  Mã đối soát ngân hàng: <strong className="font-mono text-slate-800">{matchedTx?.reference_number || `FT-${booking.bookingCode}-OK`}</strong>
                </p>
                {matchedTx?.transaction_date && (
                  <p>Thời gian giao dịch: <strong>{matchedTx.transaction_date}</strong></p>
                )}
                {matchedTx?.amount_in && (
                  <p>Số tiền đã nhận: <strong className="text-emerald-700">{parseFloat(matchedTx.amount_in).toLocaleString('vi-VN')}đ</strong></p>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* 5. QR Check-in Pass Card */}
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
