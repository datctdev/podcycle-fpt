import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus, User } from '../types';
import { CAMPUSES } from '../data/mockData';

interface TechnicianWorkspaceProps {
  currentUser: User;
  bookings: Booking[];
  onUpdateStatus: (bookingId: string, newStatus: BookingStatus, updates?: Partial<Booking>) => void;
  onOpenReceipt: (booking: Booking) => void;
  onSwitchToStudentView: () => void;
  onLogout: () => void;
}

export const TechnicianWorkspace: React.FC<TechnicianWorkspaceProps> = ({
  currentUser,
  bookings,
  onUpdateStatus,
  onOpenReceipt,
  onSwitchToStudentView,
  onLogout
}) => {
  const [selectedCampus, setSelectedCampus] = useState(CAMPUSES[0].id);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'pipeline' | 'all'>('pipeline');

  // Live timer tick every 10 seconds for countdown simulation
  const [currentSeconds, setCurrentSeconds] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCurrentSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter bookings for this station
  const stationBookings = bookings.filter((b) => {
    const matchSearch =
      b.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.phone.includes(searchTerm) ||
      (b.studentId && b.studentId.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchSearch;
  });

  // Pipeline columns
  const pendingList = stationBookings.filter((b) => b.status === 'PENDING');
  const cleaningList = stationBookings.filter((b) => b.status === 'CHECKED_IN' || b.status === 'CLEANING');
  const readyList = stationBookings.filter((b) => b.status === 'READY');
  const completedList = stationBookings.filter((b) => b.status === 'COMPLETED');

  // Stats
  const revenue = stationBookings
    .filter((b) => b.status === 'COMPLETED' || b.paymentStatus === 'PAID')
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="min-h-screen bg-[#0b1c30] text-slate-100 flex flex-col font-sans">
      
      {/* 1. TOP TECHNICIAN WORKSPACE BAR */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-lg">
        
        {/* Left: Station Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f26f21] to-[#ffb693] flex items-center justify-center text-white font-bold shadow-md shadow-orange-500/20">
            <span className="material-symbols-outlined text-[22px]">build_circle</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-extrabold text-base tracking-tight text-white">
                WORK SPACE KỸ THUẬT VIÊN
              </h1>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Trạm Đang Hoạt Động</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Kỹ thuật viên: <strong className="text-white">{currentUser.fullName}</strong> • {currentUser.studentId || 'TECH-01'}
            </p>
          </div>
        </div>

        {/* Center: Campus Station Selector */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 text-xs">
          <span className="material-symbols-outlined text-[#f26f21] text-[18px] ml-1">storefront</span>
          <span className="text-slate-400 font-medium">Bàn trực:</span>
          <select
            value={selectedCampus}
            onChange={(e) => setSelectedCampus(e.target.value)}
            className="bg-slate-900 text-white font-semibold rounded-lg px-2 py-1 border border-slate-700 focus:outline-none text-xs"
          >
            <option value="fpt-hcm">FPT Campus Q.9 (Sảnh Tự Học Tòa A)</option>
            <option value="fpt-hn">FPT Campus Hòa Lạc (Sảnh Beta Hall)</option>
          </select>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSwitchToStudentView}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px] text-[#f26f21]">visibility</span>
            <span>Xem Giao Diện Sinh Viên</span>
          </button>

          <button
            onClick={onLogout}
            title="Đăng xuất"
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-xl border border-red-500/30 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>

      </header>

      {/* 2. STATION METRICS BAR */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Chờ nhận máy:</span>
              <span className="bg-amber-500/20 text-amber-300 font-mono font-bold px-2 py-0.5 rounded border border-amber-500/30">
                {pendingList.length} máy
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Đang vệ sinh 30p:</span>
              <span className="bg-purple-500/20 text-purple-300 font-mono font-bold px-2 py-0.5 rounded border border-purple-500/30 animate-pulse">
                {cleaningList.length} máy
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Chờ khách test âm:</span>
              <span className="bg-blue-500/20 text-blue-300 font-mono font-bold px-2 py-0.5 rounded border border-blue-500/30">
                {readyList.length} máy
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Đã giao thành công:</span>
              <span className="bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                {completedList.length} máy
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Doanh Thu Ca Trực</span>
              <span className="font-heading font-extrabold text-base text-[#10B981]">
                {revenue.toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. MAIN WORKSPACE KANBAN PIPELINE */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Search & Mode Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm theo Mã đơn, Họ tên, SĐT, MSSV..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#f26f21]"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Quy trình kỹ thuật: </span>
            <span className="text-[#f26f21] font-bold">Khám lâm sàng ➔ Hút vi hạt & Khử khuẩn ➔ Test âm 100%</span>
          </div>
        </div>

        {/* 4-COLUMN KANBAN PIPELINE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* COLUMN 1: CHỜ TIẾP NHẬN */}
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-3 flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="font-heading font-bold text-xs text-slate-200 uppercase">
                  1. Chờ Tiếp Nhận
                </span>
              </div>
              <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {pendingList.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
              {pendingList.length === 0 ? (
                <div className="text-center py-10 text-slate-600 text-xs">
                  Không có đơn nào chờ tiếp nhận
                </div>
              ) : (
                pendingList.map((b) => (
                  <div
                    key={b.id}
                    className="bg-slate-800/90 rounded-xl p-3.5 border border-slate-700/80 space-y-2.5 shadow-xs"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-heading font-bold text-xs text-[#ffb693] font-mono">
                        {b.bookingCode}
                      </span>
                      <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.2 rounded font-medium">
                        {b.deviceModel}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300">
                      <p className="font-bold text-white">{b.customerName}</p>
                      <p className="text-[11px] text-slate-400">{b.phone} • {b.studentId}</p>
                      <p className="text-[11px] text-amber-400 mt-0.5">Hẹn: {b.bookingDate} ({b.slotTime})</p>
                    </div>

                    {b.issueNote && (
                      <p className="text-[10px] text-slate-400 bg-slate-900/60 p-1.5 rounded border border-slate-700/50">
                        {b.issueNote}
                      </p>
                    )}

                    <button
                      onClick={() => onUpdateStatus(b.id, 'CLEANING', {
                        technicianName: currentUser.fullName,
                        cleaningStartedAt: new Date().toISOString()
                      })}
                      className="w-full bg-[#f26f21] hover:bg-[#e05e10] text-white text-xs font-bold py-2 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                      <span>Nhận Máy & Bắt Đầu Vệ Sinh</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COLUMN 2: ĐANG VỆ SINH 30 PHÚT */}
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-3 flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse"></span>
                <span className="font-heading font-bold text-xs text-slate-200 uppercase">
                  2. Đang Vệ Sinh 30p
                </span>
              </div>
              <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {cleaningList.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
              {cleaningList.length === 0 ? (
                <div className="text-center py-10 text-slate-600 text-xs">
                  Hiện không có máy đang xử lý
                </div>
              ) : (
                cleaningList.map((b) => (
                  <div
                    key={b.id}
                    className="bg-slate-800/90 rounded-xl p-3.5 border border-purple-500/40 space-y-2.5 shadow-xs ring-1 ring-purple-500/20"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-heading font-bold text-xs text-[#ffb693] font-mono">
                        {b.bookingCode}
                      </span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px] animate-spin">refresh</span>
                        <span>Đang xử lý</span>
                      </span>
                    </div>

                    <div className="text-xs text-slate-300">
                      <p className="font-bold text-white">{b.customerName} ({b.deviceModel})</p>
                      <p className="text-[11px] text-slate-400">Kỹ thuật viên: {b.technicianName || currentUser.fullName}</p>
                    </div>

                    {/* Step Checklist for technician */}
                    <div className="bg-slate-900/80 p-2 rounded-lg space-y-1 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <span className="material-symbols-outlined text-[14px]">check_box</span>
                        <span>Rã cáu cặn màng loa</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <span className="material-symbols-outlined text-[14px]">check_box</span>
                        <span>Hút vi hạt dock sạc</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-purple-300">
                        <span className="material-symbols-outlined text-[14px]">autorenew</span>
                        <span>Khử trùng UV tiếp điểm</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onUpdateStatus(b.id, 'READY', {
                        soundClarityScore: 98
                      })}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">volume_up</span>
                      <span>Hoàn Tất ➔ Chuyển Bàn Test Âm</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COLUMN 3: CHỜ TEST ÂM & BÀN GIAO */}
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-3 flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                <span className="font-heading font-bold text-xs text-slate-200 uppercase">
                  3. Test Âm & Trả Máy
                </span>
              </div>
              <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {readyList.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
              {readyList.length === 0 ? (
                <div className="text-center py-10 text-slate-600 text-xs">
                  Không có máy chờ trả
                </div>
              ) : (
                readyList.map((b) => (
                  <div
                    key={b.id}
                    className="bg-slate-800/90 rounded-xl p-3.5 border border-blue-500/40 space-y-2.5 shadow-xs"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-heading font-bold text-xs text-blue-300 font-mono">
                        {b.bookingCode}
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                        Âm Lượng: 98%
                      </span>
                    </div>

                    <div className="text-xs text-slate-300">
                      <p className="font-bold text-white">{b.customerName} ({b.phone})</p>
                      <p className="text-[11px] text-slate-400">{b.deviceModel} • {b.amount.toLocaleString('vi-VN')}đ</p>
                    </div>

                    <div className="bg-slate-900/60 p-2 rounded-lg text-[11px] text-slate-300">
                      <p className="text-emerald-400 font-semibold">✓ Sinh viên đã đến bàn trực sảnh</p>
                      <p className="text-slate-400 text-[10px]">Hướng dẫn khách đeo thử và bật bài nhạc kiểm tra âm lượng</p>
                    </div>

                    <button
                      onClick={() => onUpdateStatus(b.id, 'COMPLETED', {
                        completedAt: new Date().toISOString(),
                        paymentStatus: 'PAID'
                      })}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      <span>Khách Đã Test & Bàn Giao</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COLUMN 4: ĐÃ HOÀN THÀNH & BIÊN NHẬN */}
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-3 flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span className="font-heading font-bold text-xs text-slate-200 uppercase">
                  4. Đã Hoàn Thành
                </span>
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {completedList.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
              {completedList.length === 0 ? (
                <div className="text-center py-10 text-slate-600 text-xs">
                  Chưa có đơn hoàn thành trong ca
                </div>
              ) : (
                completedList.map((b) => (
                  <div
                    key={b.id}
                    className="bg-slate-800/90 rounded-xl p-3.5 border border-slate-700/60 space-y-2 shadow-xs"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-heading font-bold text-xs text-slate-300 font-mono">
                        {b.bookingCode}
                      </span>
                      <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.2 rounded font-medium">
                        {b.deviceModel}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300">
                      <p className="font-bold text-white">{b.customerName}</p>
                      <p className="text-[11px] text-slate-400">{b.amount.toLocaleString('vi-VN')}đ • Đã thanh toán</p>
                    </div>

                    <button
                      onClick={() => onOpenReceipt(b)}
                      className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px] text-[#ffb693]">receipt_long</span>
                      <span>Biên Nhận Điện Tử Trước/Sau</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </main>

    </div>
  );
};
