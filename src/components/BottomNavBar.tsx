import React from 'react';

interface BottomNavBarProps {
  currentTab: 'home' | 'booking' | 'appointments' | 'staff';
  onSelectTab: (tab: 'home' | 'booking' | 'appointments' | 'staff') => void;
  bookingCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentTab, onSelectTab, bookingCount }) => {
  return (
    <nav className="fixed bottom-0 w-full z-50 bg-[#f8f9ff]/90 backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-2px_12px_rgba(15,23,42,0.06)] h-16 px-4 flex justify-around items-center md:hidden">
      
      {/* Home */}
      <button 
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center justify-center transition-all active:scale-90 ${
          currentTab === 'home' ? 'text-[#f26f21] font-bold' : 'text-slate-500 opacity-75'
        }`}
      >
        <span 
          className="material-symbols-outlined text-[22px] mb-0.5"
          style={{ fontVariationSettings: currentTab === 'home' ? "'FILL' 1" : "'FILL' 0" }}
        >
          home
        </span>
        <span className="text-[11px]">Trang chủ</span>
      </button>

      {/* Booking */}
      <button 
        onClick={() => onSelectTab('booking')}
        className={`flex flex-col items-center justify-center transition-all active:scale-90 ${
          currentTab === 'booking' ? 'text-[#f26f21] font-bold' : 'text-slate-500 opacity-75'
        }`}
      >
        <span 
          className="material-symbols-outlined text-[22px] mb-0.5"
          style={{ fontVariationSettings: currentTab === 'booking' ? "'FILL' 1" : "'FILL' 0" }}
        >
          calendar_add_on
        </span>
        <span className="text-[11px]">Đặt lịch</span>
      </button>

      {/* Appointments */}
      <button 
        onClick={() => onSelectTab('appointments')}
        className={`flex flex-col items-center justify-center transition-all active:scale-90 relative ${
          currentTab === 'appointments' ? 'text-[#f26f21] font-bold' : 'text-slate-500 opacity-75'
        }`}
      >
        <span 
          className="material-symbols-outlined text-[22px] mb-0.5"
          style={{ fontVariationSettings: currentTab === 'appointments' ? "'FILL' 1" : "'FILL' 0" }}
        >
          calendar_month
        </span>
        <span className="text-[11px]">Lịch hẹn</span>
      </button>

      {/* Staff Dispatch */}
      <button 
        onClick={() => onSelectTab('staff')}
        className={`flex flex-col items-center justify-center transition-all active:scale-90 relative ${
          currentTab === 'staff' ? 'text-[#f26f21] font-bold' : 'text-slate-500 opacity-75'
        }`}
      >
        <span 
          className="material-symbols-outlined text-[22px] mb-0.5"
          style={{ fontVariationSettings: currentTab === 'staff' ? "'FILL' 1" : "'FILL' 0" }}
        >
          engineering
        </span>
        <span className="text-[11px]">Trạm sảnh</span>
        {bookingCount > 0 && (
          <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-[#10B981]"></span>
        )}
      </button>

    </nav>
  );
};
