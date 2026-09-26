import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ServiceList } from './components/ServiceList';
import { BookingFlow } from './components/BookingFlow';
import { StaffDashboard } from './components/StaffDashboard';
import { AnalyticsInspector } from './components/AnalyticsInspector';
import { Footer } from './components/Footer';
import { INITIAL_BOOKINGS } from './data/mockData';
import { Booking, ServiceItem, BookingStatus } from './types';
import { trackEvent } from './utils/analytics';
import { ShieldCheck, Zap, Award, HelpCircle } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<'home' | 'booking' | 'staff'>('home');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  // Load bookings from localStorage or mock data
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem('ttn_bookings');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return INITIAL_BOOKINGS;
  });

  // Track initial page_view / first_open
  useEffect(() => {
    trackEvent('page_view', {
      page_title: 'Tiệm Tai Nhỏ - Đặt Lịch Vệ Sinh AirPods FPT',
      page_location: window.location.href,
      campus: 'FPT_Campus'
    });
  }, []);

  // Save bookings whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('ttn_bookings', JSON.stringify(bookings));
    } catch {
      // Ignore
    }
  }, [bookings]);

  // Handle service selection from home
  const handleSelectServiceFromHome = (service: ServiceItem) => {
    setSelectedService(service);
    setCurrentView('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle new booking
  const handleBookingCreated = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
  };

  // Handle staff status update
  const handleUpdateStatus = (bookingId: string, newStatus: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      
      {/* Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        bookingCount={bookings.filter((b) => b.status === 'PENDING' || b.status === 'CLEANING').length}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* VIEW 1: HOME */}
        {currentView === 'home' && (
          <div>
            <HeroSection
              onStartBooking={() => {
                setCurrentView('booking');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            <ServiceList onSelectService={handleSelectServiceFromHome} />

            {/* O2O Process Section */}
            <section className="py-16 bg-slate-50 border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <span className="text-blue-600 font-semibold text-xs uppercase tracking-wider">Quy Trình Tinh Gọn</span>
                  <h2 className="text-3xl font-bold text-slate-900 mt-2">Mô Hình O2O Khép Kín 4 Bước</h2>
                  <p className="text-slate-600 text-sm mt-2">
                    Không mất công di chuyển xa, không sợ bị tráo linh kiện. Mọi thao tác thực hiện trực tiếp tại trường.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-base mb-4">
                      1
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">Đặt Lịch 1 Chạm</h3>
                    <p className="text-xs text-slate-500 mt-2">
                      Chọn dòng AirPods, chọn ca rảnh giữa các tiết học và giữ slot real-time trên web.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-base mb-4">
                      2
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">Gửi Máy Tại Sảnh</h3>
                    <p className="text-xs text-slate-500 mt-2">
                      Đưa tai nghe cho nhân viên tại bàn trực sảnh tự học campus và nhận mã định danh dán trên dock.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-base mb-4">
                      3
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">Vệ Sinh 30 Phút</h3>
                    <p className="text-xs text-slate-500 mt-2">
                      Rã cặn màng loa bề ngoài, hút bụi hốc sạc và khử khuẩn bằng thiết bị chuyên dụng an toàn tuyệt đối.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-base mb-4">
                      4
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">Test & Bàn Giao</h3>
                    <p className="text-xs text-slate-500 mt-2">
                      Sinh viên nghe thử âm thanh, kiểm tra độ to rõ của loa trước khi thanh toán. Hoàn phí 100% nếu không hài lòng.
                    </p>
                  </div>

                </div>
              </div>
            </section>

            {/* Commitments & FAQ Section */}
            <section className="py-16 bg-white">
              <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold text-slate-900">Câu Hỏi Thường Gặp Về Dịch Vụ</h2>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <h4 className="font-bold text-slate-900 text-sm">Vệ sinh AirPods có làm ảnh hưởng đến màng loa hay ngấm nước không?</h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      Tuyệt đối không! Tiệm Tai Nhỏ cam kết không đổ bất kỳ chất lỏng trực tiếp nào lên màng loa. Chúng tôi sử dụng đầu tăm gòn vi sinh ẩm dung dịch bốc hơi nhanh chuyên dụng và máy hút chân không vi hạt để tách bụi an toàn.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <h4 className="font-bold text-slate-900 text-sm">Chính sách hoàn phí 100% hoạt động như thế nào?</h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      Nếu sau khi vệ sinh ngoại quan xong mà âm lượng tai nghe của bạn vẫn không to và rõ hơn so với ban đầu (do lỗi phần cứng màng loa bên trong), chúng tôi sẽ hoàn trả lại 100% số tiền dịch vụ cho bạn ngay tại chỗ.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <h4 className="font-bold text-slate-900 text-sm">Bàn trực của nhóm đặt ở đâu tại Campus FPT?</h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      Tại TP.HCM: Bàn số 2 tại sảnh tự học Tòa nhà A (cạnh Canteen). Tại Hà Nội: Sảnh Beta Hall.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: BOOKING */}
        {currentView === 'booking' && (
          <BookingFlow
            initialService={selectedService}
            onBookingCreated={handleBookingCreated}
            onBackToHome={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW 3: STAFF DISPATCH */}
        {currentView === 'staff' && (
          <StaffDashboard
            bookings={bookings}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

      </main>

      {/* Floating GA4 Live Inspector */}
      <AnalyticsInspector />

      {/* Footer */}
      <Footer />

    </div>
  );
}
export default App;
