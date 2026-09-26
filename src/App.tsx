import React, { useState, useEffect } from 'react';
import { TopAppBar } from './components/TopAppBar';
import { StitchHero } from './components/StitchHero';
import { StitchBeforeAfter } from './components/StitchBeforeAfter';
import { StitchSteps } from './components/StitchSteps';
import { StitchServices } from './components/StitchServices';
import { StitchPromotion } from './components/StitchPromotion';
import { StitchBooking } from './components/StitchBooking';
import { StitchAppointmentDetail } from './components/StitchAppointmentDetail';
import { StitchAppointmentList } from './components/StitchAppointmentList';
import { StitchReviewModal } from './components/StitchReviewModal';
import { BottomNavBar } from './components/BottomNavBar';
import { AnalyticsInspector } from './components/AnalyticsInspector';
import { Footer } from './components/Footer';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { ProfilePage } from './components/ProfilePage';
import { TechnicianWorkspace } from './components/TechnicianWorkspace';
import { DigitalReceiptModal } from './components/DigitalReceiptModal';
import { SettingsModal } from './components/SettingsModal';

import { INITIAL_BOOKINGS } from './data/mockData';
import { DEMO_USERS } from './data/mockUsers';
import { Booking, ServiceItem, BookingStatus, User } from './types';
import { trackEvent } from './utils/analytics';
import { DatabaseService } from './services/db';
import { AuthService } from './services/auth';

export function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [receiptBooking, setReceiptBooking] = useState<Booking | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('podcycle_auth_user');
      if (savedUser) return JSON.parse(savedUser);
    } catch {
      // ignore
    }
    // Default to the first demo student so the app works seamlessly out-of-the-box
    return DEMO_USERS[0];
  });

  // Persistent Bookings State
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem('podcycle_bookings');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_BOOKINGS;
  });

  // Hydrate from DatabaseService (reads from Supabase Cloud if configured, or local cache)
  useEffect(() => {
    DatabaseService.getBookings().then((fetched) => {
      if (fetched && fetched.length > 0) {
        setBookings(fetched);
      }
    });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('podcycle_bookings', JSON.stringify(bookings));
    } catch {
      // ignore
    }
  }, [bookings]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('podcycle_auth_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('podcycle_auth_user');
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  // Track initial page_view on load
  useEffect(() => {
    trackEvent('page_view', {
      page_title: 'PODCYCLE - Vệ Sinh Tai Nghe FPT Campus',
      page_location: window.location.href,
      user_role: currentUser?.role || 'GUEST'
    });
  }, []);

  // Auth Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'TECHNICIAN') {
      setCurrentTab('tech-workspace');
    } else {
      setCurrentTab('home');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRegisterSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'TECHNICIAN') {
      setCurrentTab('tech-workspace');
    } else {
      setCurrentTab('home');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentTab('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Service selection
  const handleSelectService = (service: ServiceItem) => {
    setSelectedService(service);
    setCurrentTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Booking creation
  const handleBookingCreated = (newBooking: Booking) => {
    DatabaseService.createBooking(newBooking);
    setBookings((prev) => [newBooking, ...prev]);
    setActiveBooking(newBooking);
    setCurrentTab('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Technician / Status Updates
  const handleUpdateStatus = (
    bookingId: string, 
    newStatus: BookingStatus, 
    updates?: Partial<Booking>
  ) => {
    DatabaseService.updateStatus(bookingId, newStatus, updates);
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus, ...updates } : b))
    );
    if (activeBooking && activeBooking.id === bookingId) {
      setActiveBooking((prev) => prev ? { ...prev, status: newStatus, ...updates } : null);
    }
  };

  // Receipt Modal
  const handleOpenReceipt = (booking: Booking) => {
    setReceiptBooking(booking);
    setIsReceiptOpen(true);
  };

  // Filter bookings for customer view
  const customerBookings = currentUser?.role === 'CUSTOMER'
    ? bookings.filter((b) => b.phone === currentUser.phone || b.studentId === currentUser.studentId || !b.userId)
    : bookings;

  const activeCount = bookings.filter(
    (b) => b.status === 'PENDING' || b.status === 'CLEANING' || b.status === 'CHECKED_IN'
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] text-[#0b1c30]">
      
      {/* Quick Role-Switcher Alert Bar for evaluation */}
      <div className="bg-[#0b1c30] text-slate-300 text-[11px] py-1.5 px-4 flex flex-wrap items-center justify-between border-b border-slate-800 z-50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
          <span>Đang đăng nhập: <strong className="text-white">{currentUser ? currentUser.fullName : 'Khách vãng lai'}</strong> ({currentUser?.role === 'TECHNICIAN' ? '🔧 Kỹ Thuật Viên' : '👨‍🎓 Sinh Viên'})</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1 text-[#ffb693] hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2 py-0.5 rounded transition-colors text-[11px] border border-slate-700"
            title="Cấu hình VietQR & Supabase Cloud Database"
          >
            <span className="material-symbols-outlined text-[13px] text-[#f26f21]">settings</span>
            <span>Cấu hình VietQR / Database</span>
          </button>

          {currentUser?.role === 'TECHNICIAN' ? (
            <button
              onClick={() => {
                setCurrentUser(DEMO_USERS[0]); // switch to student
                setCurrentTab('home');
              }}
              className="text-[#ffb693] hover:underline font-bold"
            >
              ⇄ Chuyển sang Sinh Viên (Châu Thành Đạt)
            </button>
          ) : (
            <button
              onClick={() => {
                setCurrentUser(DEMO_USERS[1]); // switch to technician
                setCurrentTab('tech-workspace');
              }}
              className="text-[#f26f21] hover:underline font-bold"
            >
              ⇄ Vào Workspace Kỹ Thuật Viên (Nguyễn Văn Minh)
            </button>
          )}

          {currentUser && (
            <button onClick={handleLogout} className="text-slate-400 hover:text-white">
              Đăng xuất
            </button>
          )}
        </div>
      </div>

      {/* Top App Bar (Only when not in full technician workspace) */}
      {currentTab !== 'tech-workspace' && (
        <TopAppBar
          currentTab={currentTab}
          currentUser={currentUser}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          bookingCount={activeCount}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* Main Body */}
      <main className="flex-1">
        
        {/* VIEW: LOGIN */}
        {currentTab === 'login' && (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onGoToRegister={() => setCurrentTab('register')}
            onBackToHome={() => setCurrentTab('home')}
          />
        )}

        {/* VIEW: REGISTER */}
        {currentTab === 'register' && (
          <RegisterPage
            onRegisterSuccess={handleRegisterSuccess}
            onGoToLogin={() => setCurrentTab('login')}
            onBackToHome={() => setCurrentTab('home')}
          />
        )}

        {/* VIEW: PROFILE */}
        {currentTab === 'profile' && currentUser && (
          <ProfilePage
            user={currentUser}
            bookings={bookings}
            onLogout={handleLogout}
            onGoToTechnicianWorkspace={() => setCurrentTab('tech-workspace')}
          />
        )}

        {/* VIEW: TECHNICIAN WORKSPACE (DÀNH RIÊNG CHO KỸ THUẬT VIÊN) */}
        {currentTab === 'tech-workspace' && (
          currentUser && currentUser.role === 'TECHNICIAN' ? (
            <TechnicianWorkspace
              currentUser={currentUser}
              bookings={bookings}
              onUpdateStatus={handleUpdateStatus}
              onOpenReceipt={handleOpenReceipt}
              onSwitchToStudentView={() => setCurrentTab('home')}
              onLogout={handleLogout}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          ) : (
            <div className="min-h-[80vh] flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full text-center space-y-4 text-white shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/20 text-[#f26f21] flex items-center justify-center mx-auto border border-orange-500/30">
                  <span className="material-symbols-outlined text-[32px]">lock_person</span>
                </div>
                <h2 className="font-heading font-extrabold text-xl">Khu Vực Dành Cho Kỹ Thuật Viên</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Bạn hiện đang ở vai trò <strong>{currentUser ? (currentUser.role === 'CUSTOMER' ? 'Sinh Viên' : currentUser.role) : 'Khách vãng lai'}</strong>. Khu vực này chỉ dành riêng cho Kỹ thuật viên trạm PODCYCLE FPT trực tiếp thao tác tiếp nhận và vệ sinh tai nghe.
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={async () => {
                      const res = await AuthService.login('technician@fpt.edu.vn', '123456');
                      if (res.user) handleLoginSuccess(res.user);
                    }}
                    className="w-full fpt-gradient fpt-gradient-hover text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">engineering</span>
                    <span>Đăng nhập KTV Trưởng (Nguyễn Văn Minh)</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('login')}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs py-2.5 rounded-xl border border-slate-700 transition-colors"
                  >
                    Đăng nhập tài khoản KTV khác
                  </button>
                  <button
                    onClick={() => setCurrentTab('home')}
                    className="text-xs text-slate-400 hover:text-white pt-1 transition-colors"
                  >
                    ← Quay về trang chủ Sinh Viên
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {/* VIEW: HOME (PODCYCLE STITCH UI) */}
        {currentTab === 'home' && (
          <div className="pt-16 pb-24">
            <StitchHero
              onStartBooking={() => {
                setCurrentTab('booking');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            <StitchBeforeAfter />

            <StitchSteps />

            <StitchServices onSelectService={handleSelectService} />

            <StitchPromotion
              onClaim={() => {
                setCurrentTab('booking');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {/* VIEW: BOOKING FLOW */}
        {currentTab === 'booking' && (
          <StitchBooking
            initialService={selectedService}
            currentUser={currentUser}
            allBookings={bookings}
            onBookingSuccess={handleBookingCreated}
            onBack={() => {
              setCurrentTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW: APPOINTMENT DETAIL (VÉ HẸN ĐIỆN TỬ) */}
        {currentTab === 'detail' && activeBooking && (
          <StitchAppointmentDetail
            booking={activeBooking}
            onBack={() => {
              setCurrentTab('appointments');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenReview={() => setIsReviewOpen(true)}
          />
        )}

        {/* VIEW: MY APPOINTMENTS */}
        {currentTab === 'appointments' && (
          <StitchAppointmentList
            bookings={customerBookings}
            onSelectBooking={(b) => {
              setActiveBooking(b);
              setCurrentTab('detail');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            isStaffMode={false}
          />
        )}

      </main>

      {/* Review Modal */}
      <StitchReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        bookingCode={activeBooking?.bookingCode}
      />

      {/* Digital Receipt Modal (So sánh trước sau) */}
      <DigitalReceiptModal
        isOpen={isReceiptOpen}
        booking={receiptBooking}
        onClose={() => setIsReceiptOpen(false)}
      />

      {/* Settings Modal (Cấu hình VietQR & Supabase Cloud) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={() => {
          DatabaseService.getBookings().then(setBookings);
        }}
      />

      {/* Floating GA4 Live Inspector */}
      <AnalyticsInspector />

      {/* Footer (Only for customer views) */}
      {currentTab !== 'tech-workspace' && currentTab !== 'login' && currentTab !== 'register' && (
        <Footer />
      )}

      {/* Mobile Bottom Navigation (Only for customer views) */}
      {currentTab !== 'tech-workspace' && currentTab !== 'login' && currentTab !== 'register' && (
        <BottomNavBar
          currentTab={currentTab === 'detail' ? 'booking' : currentTab}
          currentUser={currentUser}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          bookingCount={activeCount}
        />
      )}

    </div>
  );
}

export default App;
