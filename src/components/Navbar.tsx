import React from 'react';
import { Headphones, Calendar, ShieldCheck, UserCheck } from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'booking' | 'staff';
  onNavigate: (view: 'home' | 'booking' | 'staff') => void;
  bookingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, bookingCount }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">Tiệm Tai Nhỏ</span>
              <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-orange-200">
                FPT Campus
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Vệ sinh AirPods chuyên sâu 30 phút</p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'home' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Trang Chủ
          </button>

          <button
            onClick={() => onNavigate('booking')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
              currentView === 'booking' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Đặt Lịch Ngay</span>
          </button>

          <button
            onClick={() => onNavigate('staff')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
              currentView === 'staff' 
                ? 'bg-slate-900 text-white' 
                : 'text-slate-600 hover:text-slate-900 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Trạm Sảnh (Staff)</span>
            <span className="sm:hidden">Staff</span>
            {bookingCount > 0 && (
              <span className="ml-1 bg-emerald-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {bookingCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
