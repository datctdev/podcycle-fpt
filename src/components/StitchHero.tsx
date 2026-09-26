import React from 'react';
import { trackEvent } from '../utils/analytics';

interface StitchHeroProps {
  onStartBooking: () => void;
}

export const StitchHero: React.FC<StitchHeroProps> = ({ onStartBooking }) => {
  return (
    <section className="px-4 sm:px-6 mb-8 pt-4 max-w-5xl mx-auto">
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden shadow-lg border border-slate-200/80">
        
        {/* Background Image from Stitch */}
        <img
          src="/cleaning-station.png"
          alt="Trạm Vệ Sinh Tai Nghe FPT"
          className="w-full h-full object-cover"
          onError={(e) => {
            // fallback
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&q=80';
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent flex flex-col justify-center p-6 sm:p-10">
          <span className="bg-[#f26f21] text-white font-semibold text-xs px-3 py-1 rounded-full w-fit mb-3 shadow-xs">
            Dịch vụ cao cấp FPT
          </span>

          <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-white mb-2 leading-tight">
            Vệ sinh Tai nghe <br />
            <span className="text-[#ffb693]">Chuẩn Chuyên Gia 30 Phút</span>
          </h2>

          <p className="text-white/85 text-xs sm:text-sm mb-6 max-w-sm leading-relaxed">
            Làm sạch sâu, hút vi hạt màng loa và khử khuẩn 99.9% trực tiếp tại bàn trực sảnh tự học campus.
          </p>

          <button
            onClick={() => {
              trackEvent('start_booking_hero', { section: 'hero' });
              onStartBooking();
            }}
            className="fpt-gradient fpt-gradient-hover text-white font-bold text-sm sm:text-base px-6 py-3 rounded-full shadow-md active:scale-95 transition-all flex items-center gap-2 w-fit"
          >
            <span className="material-symbols-outlined text-[20px]">calendar_add_on</span>
            <span>Đặt lịch ngay</span>
          </button>
        </div>

      </div>
    </section>
  );
};
