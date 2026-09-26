import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate, useParams } from 'react-router-dom';
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
import { playStationNotification } from './utils/sound';

// Route wrapper for Appointment Detail with deep-link parameter support
function AppointmentDetailRoute({
  bookings,
  activeBooking,
  onBack,
  onOpenReview,
  onConfirmPayment
}: {
  bookings: Booking[];
  activeBooking: Booking | null;
  onBack: () => void;
  onOpenReview: () => void;
  onConfirmPayment: (id: string) => void;
}) {
  const { bookingCode } = useParams<{ bookingCode?: string }>();
  const targetBooking = bookingCode
    ? bookings.find((b) => b.bookingCode.toLowerCase() === bookingCode.toLowerCase()) || activeBooking
    : activeBooking || bookings[0];

  if (!targetBooking) {
    return (
      <div className="pt-28 pb-20 text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 rounded-2xl bg-orange-100 text-[#f26f21] flex items-center justify-center mx-auto mb-3">
          <span className="material-symbols-outlined text-[32px]">search_off</span>
        </div>
        <h2 className="font-heading font-extrabold text-lg text-[#0b1c30]">Không Tìm Thấy Đơn Đặt Lịch</h2>
        <p className="text-xs text-slate-500 mt-1">Mã lịch hẹn không tồn tại trên hệ thống hoặc đã hết hạn.</p>
        <button
          onClick={onBack}
          className="mt-4 fpt-gradient fpt-gradient-hover text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-xs"
        >
          Quay lại Lịch Hẹn
        </button>
      </div>
    );
  }

  return (
    <StitchAppointmentDetail
      booking={targetBooking}
      onBack={onBack}
      onOpenReview={onOpenReview}
      onConfirmPayment={onConfirmPayment}
    />
  );
}

// Guard component for Technician Workspace
function TechnicianGuardCard({
  currentUser,
  onLoginTechnician,
  onGoToLogin,
  onGoToHome
}: {
  currentUser: User | null;
  onLoginTechnician: () => void;
  onGoToLogin: () => void;
  onGoToHome: () => void;
}) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full text-center space-y-4 text-white shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/20 text-[#f26f21] flex items-center justify-center mx-auto border border-orange-500/30">
          <span className="material-symbols-outlined text-[32px]">lock_person</span>
        </div>
        <h2 className="font-heading font-extrabold text-xl">Khu Vực Hạn Chế Kỹ Thuật Viên</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Bạn hiện đang ở vai trò <strong>{currentUser ? (currentUser.role === 'CUSTOMER' ? 'Sinh Viên' : currentUser.role) : 'Khách vãng lai'}</strong>. Khu vực này chỉ dành riêng cho Kỹ thuật viên trạm PODCYCLE FPT trực tiếp thao tác tiếp nhận và vệ sinh tai nghe.
        </p>
        <div className="pt-2 flex flex-col gap-2.5">
          <button
            onClick={onLoginTechnician}
            className="w-full fpt-gradient fpt-gradient-hover text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">engineering</span>
            <span>Đăng nhập nhanh KTV Trưởng (Nguyễn Văn Minh)</span>
          </button>
          <button
            onClick={onGoToLogin}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs py-2.5 rounded-xl border border-slate-700 transition-colors"
          >
            Đăng nhập bằng tài khoản KTV khác
          </button>
          <button
            onClick={onGoToHome}
            className="text-xs text-slate-400 hover:text-white pt-1 transition-colors"
          >
            ← Quay về trang chủ Sinh Viên
          </button>
        </div>
      </div>
    </div>
  );
}

export function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Selected states
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

  // Hydrate from DatabaseService on mount
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

  // Track page views on location change
  useEffect(() => {
    trackEvent('page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: location.pathname,
      user_role: currentUser?.role || 'GUEST'
    });
  }, [location.pathname]);

  // Derive currentTab string for navigation bars
  const getTabFromPath = (path: string): string => {
    if (path === '/') return 'home';
    if (path.startsWith('/booking')) return 'booking';
    if (path.startsWith('/appointments')) return 'appointments';
    if (path.startsWith('/tech-workspace')) return 'tech-workspace';
    if (path.startsWith('/login')) return 'login';
    if (path.startsWith('/register')) return 'register';
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/detail')) return 'detail';
    return 'home';
  };

  const currentTab = getTabFromPath(location.pathname);

  const handleSelectTab = (tab: string) => {
    if (tab === 'home') navigate('/');
    else navigate(`/${tab}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'TECHNICIAN') {
      navigate('/tech-workspace');
    } else {
      navigate('/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRegisterSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'TECHNICIAN') {
      navigate('/tech-workspace');
    } else {
      navigate('/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Service selection
  const handleSelectService = (service: ServiceItem) => {
    setSelectedService(service);
    navigate('/booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Booking creation
  const handleBookingCreated = (newBooking: Booking) => {
    DatabaseService.createBooking(newBooking);
    setBookings((prev) => [newBooking, ...prev]);
    setActiveBooking(newBooking);
    playStationNotification('new_booking');
    navigate(`/detail/${newBooking.bookingCode}`);
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
      setActiveBooking((prev) => (prev ? { ...prev, status: newStatus, ...updates } : null));
    }
  };

  // Automated Payment confirmation
  const handleConfirmPayment = (bookingId: string) => {
    handleUpdateStatus(bookingId, 'CHECKED_IN', { paymentStatus: 'PAID' });
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

  const isTechWorkspace = location.pathname.startsWith('/tech-workspace');
  const isAuthPage = location.pathname.startsWith('/login') || location.pathname.startsWith('/register');

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
                setCurrentUser(DEMO_USERS[0]);
                navigate('/');
              }}
              className="text-[#ffb693] hover:underline font-bold"
            >
              ⇄ Chuyển sang Sinh Viên (Châu Thành Đạt)
            </button>
          ) : (
            <button
              onClick={() => {
                setCurrentUser(DEMO_USERS[1]);
                navigate('/tech-workspace');
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
      {!isTechWorkspace && (
        <TopAppBar
          currentTab={currentTab}
          currentUser={currentUser}
          onSelectTab={handleSelectTab}
          bookingCount={activeCount}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* Main Body with Real React Router */}
      <main className="flex-1">
        <Routes>
          {/* HOME ROUTE */}
          <Route
            path="/"
            element={
              <div className="pt-16 pb-24">
                <StitchHero onStartBooking={() => navigate('/booking')} />
                <StitchBeforeAfter />
                <StitchSteps />
                <StitchServices onSelectService={handleSelectService} />
                <StitchPromotion onClaim={() => navigate('/booking')} />
              </div>
            }
          />

          {/* BOOKING ROUTE */}
          <Route
            path="/booking"
            element={
              <StitchBooking
                initialService={selectedService}
                currentUser={currentUser}
                allBookings={bookings}
                onBookingSuccess={handleBookingCreated}
                onBack={() => navigate('/')}
              />
            }
          />

          {/* APPOINTMENTS LIST ROUTE */}
          <Route
            path="/appointments"
            element={
              <StitchAppointmentList
                bookings={customerBookings}
                onSelectBooking={(b) => {
                  setActiveBooking(b);
                  navigate(`/detail/${b.bookingCode}`);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                isStaffMode={false}
              />
            }
          />

          {/* APPOINTMENT DETAIL DEEP-LINK ROUTE */}
          <Route
            path="/detail"
            element={
              <AppointmentDetailRoute
                bookings={bookings}
                activeBooking={activeBooking}
                onBack={() => navigate('/appointments')}
                onOpenReview={() => setIsReviewOpen(true)}
                onConfirmPayment={handleConfirmPayment}
              />
            }
          />
          <Route
            path="/detail/:bookingCode"
            element={
              <AppointmentDetailRoute
                bookings={bookings}
                activeBooking={activeBooking}
                onBack={() => navigate('/appointments')}
                onOpenReview={() => setIsReviewOpen(true)}
                onConfirmPayment={handleConfirmPayment}
              />
            }
          />

          {/* AUTH: LOGIN */}
          <Route
            path="/login"
            element={
              <LoginPage
                onLoginSuccess={handleLoginSuccess}
                onGoToRegister={() => navigate('/register')}
                onBackToHome={() => navigate('/')}
              />
            }
          />

          {/* AUTH: REGISTER */}
          <Route
            path="/register"
            element={
              <RegisterPage
                onRegisterSuccess={handleRegisterSuccess}
                onGoToLogin={() => navigate('/login')}
                onBackToHome={() => navigate('/')}
              />
            }
          />

          {/* PROFILE ROUTE */}
          <Route
            path="/profile"
            element={
              currentUser ? (
                <ProfilePage
                  user={currentUser}
                  bookings={bookings}
                  onLogout={handleLogout}
                  onGoToTechnicianWorkspace={() => navigate('/tech-workspace')}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* TECHNICIAN WORKSPACE WITH RBAC */}
          <Route
            path="/tech-workspace"
            element={
              currentUser && currentUser.role === 'TECHNICIAN' ? (
                <TechnicianWorkspace
                  currentUser={currentUser}
                  bookings={bookings}
                  onUpdateStatus={handleUpdateStatus}
                  onOpenReceipt={handleOpenReceipt}
                  onSwitchToStudentView={() => navigate('/')}
                  onLogout={handleLogout}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                />
              ) : (
                <TechnicianGuardCard
                  currentUser={currentUser}
                  onLoginTechnician={async () => {
                    const res = await AuthService.login('technician@fpt.edu.vn', '123456');
                    if (res.user) handleLoginSuccess(res.user);
                  }}
                  onGoToLogin={() => navigate('/login')}
                  onGoToHome={() => navigate('/')}
                />
              )
            }
          />

          {/* WILDCARD FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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
      {!isTechWorkspace && !isAuthPage && <Footer />}

      {/* Mobile Bottom Navigation (Only for customer views) */}
      {!isTechWorkspace && !isAuthPage && (
        <BottomNavBar
          currentTab={currentTab === 'detail' ? 'booking' : currentTab}
          currentUser={currentUser}
          onSelectTab={handleSelectTab}
          bookingCount={activeCount}
        />
      )}

    </div>
  );
}

export default App;
