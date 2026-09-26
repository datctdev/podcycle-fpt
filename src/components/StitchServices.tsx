import React from 'react';
import { SERVICES } from '../services/dataInit';
import { ServiceItem } from '../types';
import { trackEvent } from '../utils/analytics';

interface StitchServicesProps {
  onSelectService: (service: ServiceItem) => void;
}

export const StitchServices: React.FC<StitchServicesProps> = ({ onSelectService }) => {
  const handleSelect = (service: ServiceItem) => {
    trackEvent('view_item', {
      item_id: service.id,
      item_name: service.name,
      price: service.price,
      currency: 'VND'
    });
    onSelectService(service);
  };

  return (
    <section className="px-4 sm:px-6 mb-12 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <span className="text-[#f26f21] font-bold text-xs uppercase tracking-wider">
            Gói Chăm Sóc Thiết Bị
          </span>
          <h3 className="font-heading font-bold text-2xl text-[#0b1c30]">Dịch Vụ Ngoại Quan AirPods</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {SERVICES.map((service) => {
          const isFeatured = service.id === 'deep-clean';

          return (
            <div
              key={service.id}
              className={`bg-white rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between relative border ${
                isFeatured
                  ? 'border-[#f26f21] shadow-lg ring-2 ring-[#f26f21]/20'
                  : 'border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              {service.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`text-[10px] font-bold px-3 py-0.5 rounded-full shadow-xs ${
                    isFeatured ? 'bg-[#f26f21] text-white' : 'bg-slate-800 text-white'
                  }`}>
                    {service.badge}
                  </span>
                </div>
              )}

              <div>
                <h4 className="font-heading font-bold text-lg text-[#0b1c30] mt-1">{service.name}</h4>
                <p className="text-slate-500 text-xs mt-2 min-h-[38px] leading-relaxed">
                  {service.description}
                </p>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#0b1c30]">
                    {service.price.toLocaleString('vi-VN')}đ
                  </span>
                  <span className="text-xs text-slate-400">/ máy</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg">
                  <span className="material-symbols-outlined text-[#f26f21] text-[18px]">timer</span>
                  <span>Thời gian hoàn tất: <strong>{service.duration} phút</strong></span>
                </div>

                <ul className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
                  {service.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[#10B981] text-[16px] shrink-0 mt-0.5">
                        check_circle
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-2">
                <button
                  onClick={() => handleSelect(service)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isFeatured
                      ? 'fpt-gradient fpt-gradient-hover text-white shadow-xs active:scale-95'
                      : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-95'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">calendar_add_on</span>
                  <span>Chọn Gói & Giữ Slot</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
};
