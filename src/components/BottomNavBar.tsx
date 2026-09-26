import React from 'react';
import { User } from '../types';

interface BottomNavBarProps {
  currentTab: string;
  currentUser: User | null;
  onSelectTab: (tab: string) => void;
  bookingCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  currentUser,
  onSelectTab,
  bookingCount
}) => {
  return (
    <nav className="fixed bottom-0 w-full z-50 bg-[#f8f9ff]/92 backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-2px_12px_rgba(15,23,42,0.06)] h-16 px-2 flex justify-around items-center md:hidden">
      
      {/* Home */}
      <button 
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center justify-center transition-all active:scale-90 ${
          currentTab === 'home' ? 'text-[#f26f21] font-bold' : 'text-slate-500 opacity-75'
        }`}
      >
        <span 
          className="material-symbols-outlined text-[20px] mb-0.5"
          style={{ fontVariationSettings: currentTab === 'home' ? "'FILL' 1" : "'FILL' 0" }}
        >
          home
        </span>
        <span className="text-[10px]">Trang chủ</span>
      </button>

      {/* Booking */}
      <button 
        onClick={() => onSelectTab('booking')}
        className={`flex flex-col items-center justify-center transition-all active:scale-90 ${
          currentTab === 'booking' ? 'text-[#f26f21] font-bold' : 'text-slate-500 opacity-75'
        }`}
      >
        <span 
          className="material-symbols-outlined text-[20px] mb-0.5"
          style={{ fontVariationSettings: currentTab === 'booking' ? "'FILL' 1" : "'FILL' 0" }}
        >
          calendar_add_on
        </span>
        <span className="text-[10px]">Đặt lịch</span>
      </button>

      {/* Appointments */}
      <button 
        onClick={() => onSelectTab('appointments')}
        className={`flex flex-col items-center justify-center transition-all active:scale-90 relative ${
          currentTab === 'appointments' ? 'text-[#f26f21] font-bold' : 'text-slate-500 opacity-75'
        }`}
      >
        <span 
          className="material-symbols-outlined text-[20px] mb-0.5"
          style={{ fontVariationSettings: currentTab === 'appointments' ? "'FILL' 1" : "'FILL' 0" }}
        >
          calendar_month
        </span>
        <span className="text-[10px]">Lịch hẹn</span>
      </button>

      {/* Technician Workspace */}
      <button 
        onClick={() => onSelectTab('tech-workspace')}
        className={`flex flex-col items-center justify-center transition-all active:scale-90 relative ${
          currentTab === 'tech-workspace' ? 'text-[#f26f21] font-bold' : 'text-slate-500 opacity-75'
        }`}
      >
        <span 
          className="material-symbols-outlined text-[20px] mb-0.5"
          style={{ fontVariationSettings: currentTab === 'tech-workspace' ? "'FILL' 1" : "'FILL' 0" }}
        >
          engineering
        </span>
        <span className="text-[10px]">Workspace</span>
        {bookingCount > 0 && (
          <span className="absolute top-0 right-3 w-2 h-2 rounded-full bg-[#10B981]"></span>
        )}
      </button>

      {/* Profile / Login */}
      <button 
        onClick={() => onSelectTab(currentUser ? 'profile' : 'login')}
        className={`flex flex-col items-center justify-center transition-all active:scale-90 ${
          currentTab === 'profile' || currentTab === 'login' ? 'text-[#f26f21] font-bold' : 'text-slate-500 opacity-75'
        }`}
      >
        <span 
          className="material-symbols-outlined text-[20px] mb-0.5"
          style={{ fontVariationSettings: currentTab === 'profile' ? "'FILL' 1" : "'FILL' 0" }}
        >
          account_circle
        </span>
        <span className="text-[10px]">{currentUser ? 'Hồ sơ' : 'Đăng nhập'}</span>
      </button>

    </nav>
  );
};
