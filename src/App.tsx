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

import { INITIAL_BOOKINGS } from './data/mockData';
import { DEMO_USERS } from './data/mockUsers';
import { Booking, ServiceItem, BookingStatus, User } from './types';
import { trackEvent } from './utils/analytics';

export function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [receiptBooking, setReceiptBooking] = useState<Booking | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

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
          <TechnicianWorkspace
            currentUser={currentUser && currentUser.role === 'TECHNICIAN' ? currentUser : DEMO_USERS[1]}
            bookings={bookings}
            onUpdateStatus={handleUpdateStatus}
            onOpenReceipt={handleOpenReceipt}
            onSwitchToStudentView={() => setCurrentTab('home')}
            onLogout={handleLogout}
          />
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
