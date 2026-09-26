import React from 'react';

interface TopAppBarProps {
  currentTab: 'home' | 'booking' | 'appointments' | 'staff';
  onSelectTab: (tab: 'home' | 'booking' | 'appointments' | 'staff') => void;
  bookingCount: number;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ currentTab, onSelectTab, bookingCount }) => {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#f8f9ff]/85 backdrop-blur-md shadow-xs flex items-center justify-between px-4 sm:px-6 h-16 border-b border-slate-200/60">
      
      {/* Brand & Menu */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('home')}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#f26f21] to-[#ffb693] flex items-center justify-center text-white shadow-md shadow-orange-500/20">
          <span className="material-symbols-outlined text-[20px]">headphones</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-heading font-extrabold text-base tracking-tight text-[#0b1c30]">
              PODCYCLE
            </span>
            <span className="bg-[#f26f21]/10 text-[#f26f21] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#f26f21]/20">
              FPT CAMPUS
            </span>
          </div>
          <p className="text-[11px] text-[#584238] hidden sm:block">Chăm sóc tai nghe chuyên nghiệp 30 phút</p>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-1 bg-white/70 p-1 rounded-xl border border-slate-200">
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
          onClick={() => onSelectTab('staff')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
            currentTab === 'staff'
              ? 'bg-[#0b1c30] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Trạm Sảnh (Staff)</span>
          {bookingCount > 0 && (
            <span className="bg-[#10B981] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {bookingCount}
            </span>
          )}
        </button>
      </nav>

      {/* Avatar / Profile */}
      <div 
        onClick={() => onSelectTab('staff')}
        className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
      >
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#f26f21]/30 shadow-xs">
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" 
            alt="Sinh viên FPT" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

    </header>
  );
};
