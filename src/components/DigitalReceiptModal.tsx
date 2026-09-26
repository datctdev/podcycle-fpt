import React from 'react';
import { Booking } from '../types';

interface DigitalReceiptModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({
  booking,
  isOpen,
  onClose
}) => {
  if (!isOpen || !booking) return null;

  // Tính ngày nhắc vệ sinh định kỳ (3 tháng)
  let nextDateStr = booking.nextMaintenanceDate;
  if (!nextDateStr && booking.completedAt) {
    const d = new Date(booking.completedAt);
    d.setDate(d.getDate() + 90);
    nextDateStr = d.toISOString().split('T')[0];
  } else if (!nextDateStr) {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    nextDateStr = d.toISOString().split('T')[0];
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white text-[#0b1c30] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 border border-slate-200 relative max-h-[92vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Receipt Header */}
        <div className="text-center pb-3 border-b border-dashed border-slate-200">
          <div className="inline-flex items-center gap-1.5 bg-orange-100 text-[#f26f21] text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-1">
            <span>FPT O2O STATION E-RECEIPT (READ-ONLY)</span>
          </div>
          <h2 className="font-heading font-extrabold text-xl text-[#0b1c30]">
            BIÊN NHẬN BẢO DƯỠNG ĐIỆN TỬ
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Mã đơn: <strong className="text-[#f26f21]">{booking.bookingCode}</strong>
            {booking.serialNumber && <> • Serial: <strong className="text-slate-800">{booking.serialNumber}</strong></>}
          </p>
        </div>

        {/* Customer & Station Info */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <div>
            <span className="text-slate-400 block text-[10px]">Sinh viên khách hàng:</span>
            <strong className="text-[#0b1c30]">{booking.customerName}</strong>
            <p className="text-[11px] text-slate-500">{booking.studentId} • {booking.phone}</p>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Trạm bàn giao tiếp nhận:</span>
            <strong className="text-[#0b1c30]">Bàn Trực Sảnh Tòa Nhà A</strong>
            <p className="text-[11px] text-slate-500">{booking.campus}</p>
          </div>
        </div>

        {/* Clinical Summary Before & After */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2 text-xs">
          <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
            Biên Bản Khám Lâm Sàng Đầu Vào & Đo Lường Đầu Ra:
          </span>
          
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="space-y-1 bg-white p-2 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-700 block text-[10px] uppercase text-orange-600">Đầu Vào (Before):</span>
              <p>• Vết xước: {booking.checklistBefore?.caseScratches === 'NONE' ? 'Không trầy xước' : booking.checklistBefore?.caseScratches === 'HEAVY' ? 'Trầy xước nặng' : 'Xước lông mèo nhẹ'}</p>
              <p>• Cáu cặn: {booking.checklistBefore?.earpieceGrime === 'SEVERE' ? 'Két bẩn dày' : 'Vừa phải'}</p>
              <p>• Loa L/R: {booking.checklistBefore?.leftSpeakerWorking ? '✓ Hoạt động' : '✗ Rè/Nhỏ'} / {booking.checklistBefore?.rightSpeakerWorking ? '✓ Hoạt động' : '✗ Rè/Nhỏ'}</p>
            </div>

            <div className="space-y-1 bg-white p-2 rounded-lg border border-emerald-200">
              <span className="font-bold text-slate-700 block text-[10px] uppercase text-emerald-600">Đầu Ra (After QA):</span>
              <p>• Màng loa: {booking.checklistAfter?.meshClearance !== false ? '✓ Thông thoáng 100%' : 'Chưa đạt'}</p>
              <p>• Cân bằng L/R: {booking.checklistAfter?.balanceLR !== false ? '✓ Cân bằng chuẩn' : 'Lệch'}</p>
              <p>• Micro: {booking.checklistAfter?.micClarity !== false ? '✓ Khử khuẩn nhạy' : 'Kém'}</p>
            </div>
          </div>
        </div>

        {/* Before / After Photo Comparison */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#f26f21] text-[16px]">compare</span>
              <span>Hình ảnh kiểm chứng ngoại quan màng loa thực tế:</span>
            </span>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Soi đèn tại quầy
            </span>
          </span>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-2xs relative bg-slate-100">
              <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-10">
                1. TRƯỚC VỆ SINH
              </span>
              <img
                src={booking.beforePhoto || '/before-after.png'}
                alt="Trước vệ sinh"
                className="w-full h-28 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/before-after.png';
                }}
              />
            </div>

            <div className="rounded-xl overflow-hidden border border-emerald-300 shadow-2xs relative bg-slate-100 ring-2 ring-emerald-500/20">
              <span className="absolute top-2 left-2 bg-emerald-600/90 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-10">
                2. SAU VỆ SINH 30P
              </span>
              <img
                src={booking.afterPhoto || '/clean-airpods.png'}
                alt="Sau vệ sinh"
                className="w-full h-28 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/clean-airpods.png';
                }}
              />
            </div>
          </div>
        </div>

        {/* Clinical Sound Test Score */}
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#10B981] text-[22px]">verified</span>
            <div>
              <p className="font-heading font-bold text-xs text-emerald-900">
                Kiểm định âm học lâm sàng: ĐẠT TIÊU CHUẨN
              </p>
              <p className="text-[11px] text-emerald-700">
                Màng loa sạch cặn bám, cân bằng âm lượng 2 bên tối ưu
              </p>
            </div>
          </div>
          <span className="font-heading font-black text-xl text-emerald-600">
            {booking.soundClarityScore || 98}%
          </span>
        </div>

        {/* Lịch nhắc bảo dưỡng định kỳ sau 3 tháng */}
        <div className="bg-orange-50 border border-orange-200 p-3 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#f26f21] text-[20px]">event_repeat</span>
            <div>
              <p className="font-bold text-orange-950">Lịch Nhắc Vệ Sinh Định Kỳ Lần Tới (+3 Tháng)</p>
              <p className="text-[11px] text-orange-800">
                Hệ thống tự động nhắc bạn vào ngày: <strong className="font-mono">{nextDateStr}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-1 text-xs border-t border-dashed border-slate-200 pt-3">
          <div className="flex justify-between">
            <span className="text-slate-500">Gói dịch vụ:</span>
            <span className="font-semibold text-slate-800">{booking.serviceName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Thiết bị:</span>
            <span className="font-semibold text-slate-800">{booking.deviceModel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Kỹ thuật viên phụ trách:</span>
            <span className="font-semibold text-slate-800">{booking.technicianName || 'Nguyễn Văn Minh (Trưởng ca)'}</span>
          </div>
          <div className="flex justify-between text-sm font-extrabold text-[#0b1c30] pt-1.5 border-t border-slate-100">
            <span>Tổng thanh toán ({booking.paymentMethod === 'VIETQR' ? 'SePay Gateway' : 'Tiền mặt'}):</span>
            <span className="text-[#f26f21]">{booking.amount.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>

        {/* Cam kết hoàn tiền 100% */}
        <div className="p-2.5 bg-slate-50 rounded-xl text-[10px] text-slate-500 text-center border border-slate-200/70">
          🛡️ <strong>Cam kết PODCYCLE:</strong> Hoàn phí 100% nếu âm thanh không cải thiện sau quy trình vệ sinh chuyên sâu do lỗi sâu phần cứng.
        </div>

        {/* Footer print / close */}
        <div className="pt-1 flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>In / Lưu E-Receipt PDF</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
