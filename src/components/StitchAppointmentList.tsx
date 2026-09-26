import React, { useState } from 'react';
import { Booking, BookingStatus } from '../types';

interface StitchAppointmentListProps {
  bookings: Booking[];
  onSelectBooking: (booking: Booking) => void;
  onUpdateStatus?: (bookingId: string, status: BookingStatus) => void;
  isStaffMode?: boolean;
}

export const StitchAppointmentList: React.FC<StitchAppointmentListProps> = ({
  bookings,
  onSelectBooking,
  onUpdateStatus,
  isStaffMode = false
}) => {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'CLEANING' | 'COMPLETED'>('ALL');

  const filtered = bookings.filter((b) => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') return b.status === 'PENDING' || b.status === 'CHECKED_IN';
    if (filter === 'CLEANING') return b.status === 'CLEANING';
    if (filter === 'COMPLETED') return b.status === 'COMPLETED' || b.status === 'READY';
    return true;
  });

  return (
    <div className="pt-20 pb-28 px-4 sm:px-6 max-w-3xl mx-auto space-y-5">
      
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-heading font-bold text-xl text-[#0b1c30]">
            {isStaffMode ? 'Điều Phối Đơn Trạm Sảnh' : 'Lịch Hẹn Của Bạn'}
          </h1>
          <p className="text-slate-500 text-xs">
            {isStaffMode ? 'Cập nhật tiến độ vệ sinh máy thực tế cho sinh viên' : 'Theo dõi trạng thái vệ sinh tai nghe real-time'}
          </p>
        </div>

        <span className="bg-orange-100 text-[#f26f21] text-xs font-bold px-3 py-1 rounded-full">
          {bookings.length} đơn
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: 'Tất cả' },
          { id: 'PENDING', label: 'Chờ giao máy' },
          { id: 'CLEANING', label: 'Đang vệ sinh' },
          { id: 'COMPLETED', label: 'Đã hoàn thành' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filter === tab.id
                ? 'bg-[#0b1c30] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400 text-xs">
            Chưa có lịch hẹn nào trong danh mục này.
          </div>
        ) : (
          filtered.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:border-orange-300 transition-all space-y-3 cursor-pointer"
              onClick={() => onSelectBooking(b)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-extrabold text-sm text-[#0b1c30]">
                    {b.bookingCode}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                    {b.deviceModel}
                  </span>
                </div>

                <span className={`text-[10px] font-bold px-2.5 py-0.8 rounded-full ${
                  b.status === 'PENDING'
                    ? 'bg-amber-100 text-amber-800'
                    : b.status === 'CLEANING'
                      ? 'bg-purple-100 text-purple-800 animate-pulse'
                      : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {b.status === 'PENDING' ? 'Chờ Khách Bàn Giao' : b.status === 'CLEANING' ? 'Đang Vệ Sinh 30p' : 'Đã Hoàn Thành'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">Thời gian hẹn</span>
                  <strong>{b.bookingDate} ({b.slotTime})</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Khách hàng</span>
                  <strong>{b.customerName} - {b.phone}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="font-bold text-[#f26f21]">
                  {b.amount.toLocaleString('vi-VN')}đ ({b.paymentMethod === 'VIETQR' ? 'SePay' : 'Tiền mặt'})
                </span>

                {isStaffMode && onUpdateStatus ? (
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {b.status === 'PENDING' && (
                      <button
                        onClick={() => onUpdateStatus(b.id, 'CLEANING')}
                        className="bg-[#f26f21] hover:bg-[#e05e10] text-white text-[11px] font-bold px-3 py-1 rounded-lg"
                      >
                        Bắt đầu vệ sinh
                      </button>
                    )}
                    {b.status === 'CLEANING' && (
                      <button
                        onClick={() => onUpdateStatus(b.id, 'COMPLETED')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1 rounded-lg"
                      >
                        Xong & Bàn giao
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <span>Xem vé hẹn</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
