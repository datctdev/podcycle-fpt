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
import { ContactPage } from './components/ContactPage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';

import { Booking, ServiceItem, BookingStatus, User } from './types';
import { trackEvent } from './utils/analytics';
import { DatabaseService, initSupabase } from './services/db';
import { playStationNotification } from './utils/sound';
import { redirectToSePayCheckout } from './services/sepay';

// Route wrapper for Appointment Detail with deep-link parameter support
function AppointmentDetailRoute({
  bookings,
  activeBooking,
  onBack,
  onOpenReview,
  onConfirmPayment,
  dbStatus,
  onRefresh
}: {
  bookings: Booking[];
  activeBooking: Booking | null;
  onBack: () => void;
  onOpenReview: () => void;
  onConfirmPayment: (id: string) => void;
  dbStatus: 'CONNECTING' | 'CONNECTED' | 'ERROR';
  onRefresh: () => void;
}) {
  const { bookingCode } = useParams<{ bookingCode?: string }>();
  const [directBooking, setDirectBooking] = useState<Booking | null>(null);
  const [isFetchingDirect, setIsFetchingDirect] = useState(false);

  const matched = bookingCode
    ? bookings.find((b) => b.bookingCode.toLowerCase() === bookingCode.toLowerCase()) || activeBooking
    : activeBooking || bookings[0];

  const targetBooking = matched || directBooking;

  useEffect(() => {
    if (!targetBooking && bookingCode) {
      setIsFetchingDirect(true);
      DatabaseService.getBookingByCode(bookingCode)
        .then((b) => {
          if (b) setDirectBooking(b);
        })
        .finally(() => setIsFetchingDirect(false));
    }
  }, [bookingCode, targetBooking]);

  if (!targetBooking) {
    if (dbStatus === 'CONNECTING' || isFetchingDirect) {
      return (
        <div className="pt-28 pb-20 text-center max-w-md mx-auto px-4">
          <div className="w-9 h-9 border-3 border-[#f26f21] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <h2 className="font-heading font-bold text-sm text-[#0b1c30]">Đang Tải Chi Tiết Lịch Hẹn...</h2>
          <p className="text-xs text-slate-500 mt-1">Đang đồng bộ dữ liệu giao dịch từ hệ thống.</p>
        </div>
      );
    }
    return (
      <div className="pt-28 pb-20 text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 rounded-2xl bg-orange-100 text-[#f26f21] flex items-center justify-center mx-auto mb-3">
          <span className="material-symbols-outlined text-[32px]">search_off</span>
        </div>
        <h2 className="font-heading font-extrabold text-lg text-[#0b1c30]">Không Tìm Thấy Đơn Đặt Lịch</h2>
        <p className="text-xs text-slate-500 mt-1">Mã lịch hẹn không tồn tại trên hệ thống hoặc đã hết hạn.</p>
        <button
          onClick={onBack}
          className="mt-4 fpt-gradient fpt-gradient-hover text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-xs cursor-pointer"
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
      onRefresh={onRefresh}
    />
  );
}

// Guard component for Technician Workspace
function TechnicianGuardCard({
  currentUser,
  onGoToLogin,
  onGoToHome
}: {
  currentUser: User | null;
  onGoToLogin: () => void;
  onGoToHome: () => void;
}) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full text-center space-y-4 text-white shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/20 text-[#f26f21] flex items-center justify-center mx-auto border border-orange-500/30">
          <span className="material-symbols-outlined text-[32px]">lock_person</span>
        </div>
        <h2 className="font-heading font-extrabold text-xl">Khu Vực Dành Cho Kỹ Thuật Viên</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Tài khoản hiện tại của bạn là <strong>{currentUser ? (currentUser.role === 'CUSTOMER' ? 'Sinh Viên' : currentUser.role) : 'Khách vãng lai'}</strong>. Khu vực này chỉ dành riêng cho Kỹ thuật viên trạm PODCYCLE FPT trực tiếp thao tác tiếp nhận và vệ sinh tai nghe.
        </p>
        <div className="pt-2 flex flex-col gap-2.5">
          <button
            onClick={onGoToLogin}
            className="w-full fpt-gradient fpt-gradient-hover text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            <span>Đăng nhập tài khoản Kỹ thuật viên</span>
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

  // Authentication State: Null by default if not stored in localStorage
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('podcycle_auth_user');
      if (savedUser) return JSON.parse(savedUser);
    } catch {
      // ignore
    }
    return null;
  });

  // REAL DATABASE STATE: Bắt buộc lấy từ PostgreSQL Supabase, ZERO fallback mock/localStorage!
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dbStatus, setDbStatus] = useState<'CONNECTING' | 'CONNECTED' | 'ERROR'>('CONNECTING');
  const [dbErrorMessage, setDbErrorMessage] = useState<string>('');

  // AUTH GUARD: Cho phép truy cập Public Trang chủ ('/'), Đăng nhập, Đăng ký, Liên hệ, Chính sách
  useEffect(() => {
    const isPublicRoute =
      location.pathname === '/' ||
      location.pathname.startsWith('/login') ||
      location.pathname.startsWith('/register') ||
      location.pathname.startsWith('/contact') ||
      location.pathname.startsWith('/privacy');
    if (!currentUser && !isPublicRoute) {
      navigate('/login', { replace: true });
    }
  }, [currentUser, location.pathname]);

  // Hàm load dữ liệu trực tiếp từ PostgreSQL Supabase
  const refreshBookingsFromDatabase = () => {
    setDbStatus('CONNECTING');
    DatabaseService.getBookings()
      .then((fetched) => {
        setBookings(fetched);
        setDbStatus('CONNECTED');
        setDbErrorMessage('');
      })
      .catch((err: any) => {
        setDbStatus('ERROR');
        setDbErrorMessage(err.message || 'Lỗi kết nối cơ sở dữ liệu Supabase.');
        console.error('[App] Database error:', err);
      });
  };

  // Hydrate directly from Database on mount & Setup Supabase Realtime synchronization
  useEffect(() => {
    refreshBookingsFromDatabase();

    // Lắng nghe biến động Realtime từ bảng bookings (Tự động cập nhật không cần F5)
    try {
      const sb = initSupabase();
      const channel = sb
        .channel('realtime_bookings_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bookings' },
          () => {
            DatabaseService.getBookings()
              .then((fetched) => setBookings(fetched))
              .catch(() => {});
          }
        )
        .subscribe();

      return () => {
        sb.removeChannel(channel);
      };
    } catch (err) {
      console.warn('[Realtime Subscription Warning]', err);
    }
  }, []);

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
    if (path.startsWith('/contact')) return 'contact';
    if (path.startsWith('/privacy')) return 'privacy';
    return 'home';
  };

  const currentTab = getTabFromPath(location.pathname);

  const handleSelectTab = (tab: string) => {
    if (tab === 'home') {
      navigate('/');
    } else if (!currentUser && (tab === 'booking' || tab === 'appointments' || tab === 'profile')) {
      navigate('/login');
    } else {
      navigate(`/${tab}`);
    }
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

  // Booking creation - Ghi trực tiếp vào PostgreSQL và Đẩy trực tiếp qua Cổng SePay
  const handleBookingCreated = async (newBooking: Booking) => {
    try {
      const saved = await DatabaseService.createBooking(newBooking);
      setBookings((prev) => [saved, ...prev]);
      setActiveBooking(saved);
      playStationNotification('new_booking');

      if (saved.paymentMethod === 'VIETQR') {
        // Đẩy thẳng sang Cổng Thanh Toán SePay chính thức toàn màn hình (Full-page Redirect)
        // Tuyệt đối KHÔNG navigate vào /detail ở đây!
        redirectToSePayCheckout({
          bookingCode: saved.bookingCode,
          amount: saved.amount,
          description: `PODCYCLE ${saved.bookingCode}`,
          customerId: saved.studentId || saved.phone
        });
        return;
      }

      // Chỉ chuyển hướng vào /detail khi khách chọn Thanh toán Tiền mặt tại trạm
      navigate(`/detail/${saved.bookingCode}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      alert(`[Lỗi Cơ Sở Dữ Liệu] Không thể tạo đơn: ${err.message}`);
    }
  };

  // Technician / Status Updates - Cập nhật trực tiếp vào PostgreSQL
  const handleUpdateStatus = async (
    bookingId: string, 
    newStatus: BookingStatus, 
    updates?: Partial<Booking>
  ) => {
    try {
      await DatabaseService.updateStatus(bookingId, newStatus, updates);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus, ...updates } : b))
      );
      if (activeBooking && activeBooking.id === bookingId) {
        setActiveBooking((prev) => (prev ? { ...prev, status: newStatus, ...updates } : null));
      }
      playStationNotification('complete');
    } catch (err: any) {
      alert(`[Lỗi Cơ Sở Dữ Liệu] Không thể cập nhật trạng thái: ${err.message}`);
    }
  };

  // Automated Payment confirmation (Giai đoạn 2: Thanh toán thành công -> CONFIRMED)
  const handleConfirmPayment = (bookingId: string) => {
    handleUpdateStatus(bookingId, 'CONFIRMED', { paymentStatus: 'PAID' });
  };

  // Receipt Modal
  const handleOpenReceipt = (booking: Booking) => {
    setReceiptBooking(booking);
    setIsReceiptOpen(true);
  };

  // Filter bookings for customer view: CHỈ LẤY ĐÚNG LỊCH HẸN CỦA TÀI KHOẢN ĐANG ĐĂNG NHẬP
  const customerBookings = currentUser
    ? bookings.filter((b) => {
        if (b.userId && b.userId === currentUser.id) return true;
        if (currentUser.phone && b.phone && b.phone.trim() === currentUser.phone.trim()) return true;
        if (currentUser.studentId && b.studentId && b.studentId.trim().toUpperCase() === currentUser.studentId.trim().toUpperCase()) return true;
        return false;
      })
    : [];

  const activeCount = bookings.filter(
    (b) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && b.status !== 'REFUNDED'
  ).length;

  const isTechWorkspace = location.pathname.startsWith('/tech-workspace');
  const isAuthPage = location.pathname.startsWith('/login') || location.pathname.startsWith('/register');

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] text-[#0b1c30]">
      
      {/* Top App Bar (Only when logged in and not in full technician workspace) */}
      {!isTechWorkspace && !isAuthPage && (
        <TopAppBar
          currentTab={currentTab}
          currentUser={currentUser}
          onSelectTab={handleSelectTab}
          bookingCount={activeCount}
        />
      )}

      {/* Real Database Connection Alert Banner */}
      {dbStatus === 'ERROR' && !isAuthPage && (
        <div className="bg-red-600 text-white text-xs px-4 py-2 flex items-center justify-between shadow-md z-40 fixed top-16 left-0 right-0">
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
            <span className="material-symbols-outlined text-[18px] shrink-0">database</span>
            <span className="font-bold shrink-0">DATABASE THỰC:</span>
            <span className="truncate">{dbErrorMessage}</span>
          </div>
        </div>
      )}

      {/* Main Body with Real React Router */}
      <main className="flex-1">
        <Routes>
          {/* AUTH: LOGIN */}
          <Route
            path="/login"
            element={
              currentUser ? (
                <Navigate to={currentUser.role === 'TECHNICIAN' ? '/tech-workspace' : '/'} replace />
              ) : (
                <LoginPage
                  onLoginSuccess={handleLoginSuccess}
                  onGoToRegister={() => navigate('/register')}
                  onBackToHome={() => {
                    if (currentUser) navigate('/');
                  }}
                />
              )
            }
          />

          {/* AUTH: REGISTER */}
          <Route
            path="/register"
            element={
              currentUser ? (
                <Navigate to={currentUser.role === 'TECHNICIAN' ? '/tech-workspace' : '/'} replace />
              ) : (
                <RegisterPage
                  onRegisterSuccess={handleRegisterSuccess}
                  onGoToLogin={() => navigate('/login')}
                  onBackToHome={() => {
                    if (currentUser) navigate('/');
                  }}
                />
              )
            }
          />

          {/* HOME ROUTE (Public - Khách vãng lai xem thoải mái) */}
          <Route
            path="/"
            element={
              <div className="pt-16 pb-24">
                <StitchHero onStartBooking={() => navigate(currentUser ? '/booking' : '/login')} />
                <StitchBeforeAfter />
                <StitchSteps />
                <StitchServices onSelectService={(service) => {
                  setSelectedService(service);
                  navigate(currentUser ? '/booking' : '/login');
                }} />
                <StitchPromotion onClaim={() => navigate(currentUser ? '/booking' : '/login')} />
              </div>
            }
          />

          {/* BOOKING ROUTE (Protected) */}
          <Route
            path="/booking"
            element={
              currentUser ? (
                <StitchBooking
                  initialService={selectedService}
                  currentUser={currentUser}
                  allBookings={bookings}
                  onBookingSuccess={handleBookingCreated}
                  onBack={() => navigate('/')}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* APPOINTMENTS LIST ROUTE (Protected) */}
          <Route
            path="/appointments"
            element={
              currentUser ? (
                <StitchAppointmentList
                  bookings={currentUser.role === 'TECHNICIAN' ? bookings : customerBookings}
                  onSelectBooking={(b) => {
                    setActiveBooking(b);
                    navigate(`/detail/${b.bookingCode}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  isStaffMode={currentUser.role === 'TECHNICIAN'}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* APPOINTMENT DETAIL DEEP-LINK ROUTE (Protected) */}
          <Route
            path="/detail"
            element={
              currentUser ? (
                <AppointmentDetailRoute
                  bookings={bookings}
                  activeBooking={activeBooking}
                  onBack={() => navigate('/appointments')}
                  onOpenReview={() => setIsReviewOpen(true)}
                  onConfirmPayment={handleConfirmPayment}
                  dbStatus={dbStatus}
                  onRefresh={refreshBookingsFromDatabase}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/detail/:bookingCode"
            element={
              currentUser ? (
                <AppointmentDetailRoute
                  bookings={bookings}
                  activeBooking={activeBooking}
                  onBack={() => navigate('/appointments')}
                  onOpenReview={() => setIsReviewOpen(true)}
                  onConfirmPayment={handleConfirmPayment}
                  dbStatus={dbStatus}
                  onRefresh={refreshBookingsFromDatabase}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* PROFILE ROUTE (Protected - Chỉ truyền lịch hẹn của chính user) */}
          <Route
            path="/profile"
            element={
              currentUser ? (
                <ProfilePage
                  user={currentUser}
                  bookings={customerBookings}
                  onLogout={handleLogout}
                  onGoToTechnicianWorkspace={() => navigate('/tech-workspace')}
                  onNavigate={handleSelectTab}
                  onOpenReceipt={handleOpenReceipt}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* CONTACT ROUTE (Public/Protected) */}
          <Route
            path="/contact"
            element={
              <ContactPage
                currentUser={currentUser}
                onBackToHome={() => navigate('/')}
              />
            }
          />

          {/* PRIVACY POLICY ROUTE (Bắt buộc CH Play & Nghị định 13) */}
          <Route
            path="/privacy"
            element={
              <PrivacyPolicyPage
                onBackToHome={() => navigate('/')}
              />
            }
          />

          {/* TECHNICIAN WORKSPACE WITH STRICT RBAC */}
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
                />
              ) : (
                <TechnicianGuardCard
                  currentUser={currentUser}
                  onGoToLogin={() => navigate('/login')}
                  onGoToHome={() => navigate('/')}
                />
              )
            }
          />

          {/* WILDCARD FALLBACK */}
          <Route path="*" element={<Navigate to={currentUser ? "/" : "/login"} replace />} />
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

      {/* Floating GA4 Live Inspector */}
      <AnalyticsInspector />

      {/* Footer (Only for customer views) */}
      {!isTechWorkspace && !isAuthPage && <Footer onNavigate={handleSelectTab} />}

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
