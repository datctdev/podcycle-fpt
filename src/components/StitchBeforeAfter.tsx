import React from 'react';

export const StitchBeforeAfter: React.FC = () => {
  return (
    <section className="px-4 sm:px-6 mb-8 max-w-5xl mx-auto">
      <div className="flex flex-col gap-3">
        
        <div>
          <h3 className="font-heading font-bold text-xl text-[#0b1c30]">Hiệu quả rõ rệt</h3>
          <p className="text-slate-500 text-xs sm:text-sm">Chất lượng phục hồi âm thanh được kiểm chứng qua từng đơn hàng</p>
        </div>

        <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 aspect-[16/9] sm:aspect-[21/9]">
          <img
            src="/clean-airpods.png"
            alt="AirPods sạch bóng trước và sau"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=1000&q=80';
            }}
          />

          <div className="absolute bottom-4 left-4 glass-card px-4 py-2 rounded-xl shadow-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[#f26f21] text-[18px]">compare</span>
            <span className="text-xs font-bold text-[#0b1c30]">Kết quả thực tế sau 30 phút tại Campus</span>
          </div>

          <div className="absolute top-4 right-4 bg-emerald-600/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md">
            Phục hồi 95-100% âm lượng ban đầu
          </div>
        </div>

      </div>
    </section>
  );
};
