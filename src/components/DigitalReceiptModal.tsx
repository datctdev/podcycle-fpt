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

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white text-[#0b1c30] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 border border-slate-200 relative max-h-[90vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Receipt Header */}
        <div className="text-center pb-3 border-b border-dashed border-slate-200">
          <div className="inline-flex items-center gap-1.5 bg-orange-100 text-[#f26f21] text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-2">
            <span>FPT O2O STATION RECEIPT</span>
          </div>
          <h2 className="font-heading font-extrabold text-xl text-[#0b1c30]">
            HÓA ĐƠN & BIÊN NHẬN ĐIỆN TỬ
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">Mã số đơn: {booking.bookingCode}</p>
        </div>

        {/* Customer & Station Info */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <div>
            <span className="text-slate-400 block text-[10px]">Sinh viên khách hàng</span>
            <strong className="text-[#0b1c30]">{booking.customerName}</strong>
            <p className="text-[11px] text-slate-500">{booking.studentId} • {booking.phone}</p>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Trạm tiếp nhận</span>
            <strong className="text-[#0b1c30]">Bàn Trực Sảnh Tòa A</strong>
            <p className="text-[11px] text-slate-500">{booking.campus}</p>
          </div>
        </div>

        {/* Before / After Photo Comparison */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#f26f21] text-[16px]">compare</span>
            <span>Hình ảnh kiểm chứng ngoại quan (Trước & Sau):</span>
          </span>

          <div className="rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
            <img
              src="/clean-airpods.png"
              alt="Biên nhận so sánh trước sau"
              className="w-full h-36 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80';
              }}
            />
          </div>
        </div>

        {/* Clinical Sound Test Score */}
        <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#10B981] text-[24px]">verified</span>
            <div>
              <p className="font-heading font-bold text-xs text-emerald-900">
                Kiểm tra âm thanh lâm sàng: ĐẠT CHUẨN
              </p>
              <p className="text-[11px] text-emerald-700">
                Màng loa thông thoáng, độ cân bằng L/R đạt 98%
              </p>
            </div>
          </div>
          <span className="font-heading font-black text-lg text-emerald-600">98%</span>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-1.5 text-xs border-t border-dashed border-slate-200 pt-3">
          <div className="flex justify-between">
            <span className="text-slate-500">Dịch vụ:</span>
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
            <span>Tổng thanh toán:</span>
            <span className="text-[#f26f21]">{booking.amount.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>

        {/* Footer print / close */}
        <div className="pt-2 flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>In / Lưu Hóa Đơn PDF</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2.5 rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
