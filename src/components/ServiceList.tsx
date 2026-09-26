import React from 'react';
import { SERVICES } from '../data/mockData';
import { ServiceItem } from '../types';
import { Check, Clock, Sparkles } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

interface ServiceListProps {
  onSelectService: (service: ServiceItem) => void;
}

export const ServiceList: React.FC<ServiceListProps> = ({ onSelectService }) => {
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
    <section id="services" className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-blue-600 font-semibold text-sm tracking-wide uppercase">Bảng Giá Dịch Vụ Sinh Viên</span>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">Dịch Vụ Vệ Sinh Ngoại Quan AirPods</h2>
          <p className="text-slate-600 mt-3 text-base">
            Mức giá trợ giá sinh viên FPT, bảo dưỡng bằng hóa chất an toàn và máy hút bụi vi hạt chuyên dụng.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SERVICES.map((service, index) => {
            const isFeatured = service.id === 'deep-clean';

            return (
              <div
                key={service.id}
                className={`rounded-2xl transition-all duration-200 flex flex-col justify-between p-6 relative ${
                  isFeatured 
                    ? 'border-2 border-blue-600 shadow-xl shadow-blue-500/10 bg-white ring-4 ring-blue-50' 
                    : 'border border-slate-200 shadow-md bg-white hover:border-slate-300'
                }`}
              >
                {service.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-sm ${
                      isFeatured ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white'
                    }`}>
                      {service.badge}
                    </span>
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">{service.name}</h3>
                  <p className="text-sm text-slate-500 mt-2 min-h-[40px]">{service.description}</p>

                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {service.price.toLocaleString('vi-VN')}đ
                    </span>
                    <span className="text-xs text-slate-500">/ lần</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Thời gian xử lý: <strong>{service.duration} phút</strong></span>
                  </div>

                  {/* Feature list */}
                  <ul className="mt-6 space-y-3 border-t border-slate-100 pt-6">
                    {service.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  <button
                    onClick={() => handleSelect(service)}
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                      isFeatured
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Chọn Gói Này & Đặt Lịch</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
