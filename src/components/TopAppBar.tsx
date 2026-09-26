import React from 'react';
import { User } from '../types';

interface TopAppBarProps {
  currentTab: string;
  currentUser: User | null;
  onSelectTab: (tab: string) => void;
  bookingCount: number;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  currentTab,
  currentUser,
  onSelectTab,
  bookingCount
}) => {
  const isTechnician = currentUser?.role === 'TECHNICIAN';

  return (
    <header className="fixed top-0 w-full z-50 bg-[#f8f9ff]/85 backdrop-blur-md shadow-xs flex items-center justify-between px-4 sm:px-6 h-16 border-b border-slate-200/60">
      
      {/* Brand & Menu */}
      <div 
        className="flex items-center gap-3 cursor-pointer" 
        onClick={() => onSelectTab(isTechnician ? 'tech-workspace' : 'home')}
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#f26f21] to-[#ffb693] flex items-center justify-center text-white shadow-md shadow-orange-500/20">
          <span className="material-symbols-outlined text-[20px]">headphones</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-heading font-extrabold text-base tracking-tight text-[#0b1c30]">
              PODCYCLE
            </span>
            <span className="bg-[#f26f21]/10 text-[#f26f21] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#f26f21]/20">
              {isTechnician ? 'KTV STATION' : 'FPT CAMPUS Q.9'}
            </span>
          </div>
          <p className="text-[11px] text-[#584238] hidden sm:block">
            {isTechnician ? 'Trạm tiếp nhận & kiểm định âm thanh' : 'Chăm sóc tai nghe chuyên nghiệp 30 phút'}
          </p>
        </div>
      </div>

      {/* Desktop Navigation - PHÂN QUYỀN TÁCH BIỆT RÕ RÀNG */}
      <nav className="hidden md:flex items-center gap-1 bg-white/70 p-1 rounded-xl border border-slate-200">
        {isTechnician ? (
          // MENU DÀNH RIÊNG CHO KỸ THUẬT VIÊN
          <>
            <button
              onClick={() => onSelectTab('tech-workspace')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentTab === 'tech-workspace'
                  ? 'bg-[#0b1c30] text-white shadow-xs'
                  : 'text-[#0b1c30] hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-[#f26f21]">engineering</span>
              <span>Bàn Trực Kỹ Thuật Viên</span>
              {bookingCount > 0 && (
                <span className="bg-[#10B981] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {bookingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('appointments')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'appointments'
                  ? 'bg-[#f26f21] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Tất cả Lịch Hẹn Trạm
            </button>

            <button
              onClick={() => onSelectTab('contact')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'contact'
                  ? 'bg-[#f26f21] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Hotline Ca Trực
            </button>
          </>
        ) : (
          // MENU DÀNH RIÊNG CHO KHÁCH HÀNG (SINH VIÊN)
          <>
            <button
              onClick={() => onSelectTab('home')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'home'
                  ? 'bg-[#f26f21] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Trang chủ
            </button>

            <button
              onClick={() => onSelectTab('booking')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'booking'
                  ? 'bg-[#f26f21] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Đặt lịch
            </button>

            <button
              onClick={() => onSelectTab('appointments')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'appointments'
                  ? 'bg-[#f26f21] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Lịch hẹn của tôi
            </button>

            <button
              onClick={() => onSelectTab('contact')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'contact'
                  ? 'bg-[#f26f21] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Liên hệ & Hỗ trợ
            </button>
          </>
        )}
      </nav>

      {/* User Login/Profile (Đã bỏ bánh răng cấu hình) */}
      <div className="flex items-center gap-2">

        {currentUser ? (
          <div
            onClick={() => onSelectTab('profile')}
            className="flex items-center gap-2 cursor-pointer p-1 pr-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-orange-300 transition-colors"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#f26f21]/40">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt={currentUser.fullName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[11px] font-bold text-[#0b1c30] truncate max-w-[100px]">
                {currentUser.fullName}
              </p>
              <p className="text-[9px] text-[#f26f21] font-semibold">
                {currentUser.role === 'TECHNICIAN' ? 'Kỹ thuật viên' : 'Sinh viên FPT'}
              </p>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onSelectTab('login')}
            className="fpt-gradient fpt-gradient-hover text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">account_circle</span>
            <span>Đăng nhập</span>
          </button>
        )}
      </div>

    </header>
  );
};
