import React from 'react';

interface StitchPromotionProps {
  onClaim: () => void;
}

export const StitchPromotion: React.FC<StitchPromotionProps> = ({ onClaim }) => {
  return (
    <section className="px-4 sm:px-6 mb-12 max-w-5xl mx-auto">
      <div className="bg-[#4c56af] text-white p-6 sm:p-8 rounded-2xl relative overflow-hidden shadow-md">
        <div className="relative z-10 max-w-md">
          <p className="text-xs uppercase tracking-wider text-orange-200 font-bold mb-1">
            Ưu đãi sinh viên FPT K18 - K20
          </p>
          <h3 className="font-heading font-extrabold text-2xl sm:text-3xl mb-3 leading-tight">
            Giảm 20% Cho Lần Đầu Trải Nghiệm
          </h3>
          <p className="text-xs sm:text-sm text-white/80 mb-5 leading-relaxed">
            Chỉ còn 72.000đ cho gói vệ sinh chuyên sâu Deep Cleaning 30 phút. Áp dụng khi đặt lịch online hôm nay.
          </p>
          <button
            onClick={onClaim}
            className="bg-white text-[#4c56af] hover:bg-orange-50 font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full active:scale-95 transition-transform shadow-xs"
          >
            Nhận ưu đãi & Đặt lịch
          </button>
        </div>

        {/* Decorative Blur Circles from Stitch */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -left-10 -top-10 w-36 h-36 bg-[#f26f21]/40 rounded-full blur-2xl pointer-events-none"></div>
      </div>
    </section>
  );
};
