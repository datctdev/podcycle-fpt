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
import { INITIAL_BOOKINGS } from './data/mockData';
import { Booking, ServiceItem, BookingStatus } from './types';
import { trackEvent } from './utils/analytics';

export function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'booking' | 'appointments' | 'staff' | 'detail'>('home');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Persistence for bookings
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

  // Track initial page_view on load
  useEffect(() => {
    trackEvent('page_view', {
      page_title: 'PODCYCLE - Vệ Sinh Tai Nghe FPT Campus',
      page_location: window.location.href,
      theme: 'sonic_purity_system'
    });
  }, []);

  // Handlers
  const handleSelectService = (service: ServiceItem) => {
    setSelectedService(service);
    setCurrentTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookingCreated = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
    setActiveBooking(newBooking);
    setCurrentTab('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateStatus = (bookingId: string, status: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
    );
    if (activeBooking && activeBooking.id === bookingId) {
      setActiveBooking((prev) => prev ? { ...prev, status } : null);
    }
  };

  const activeCount = bookings.filter(
    (b) => b.status === 'PENDING' || b.status === 'CLEANING'
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] text-[#0b1c30]">
      
      {/* Top App Bar */}
      <TopAppBar
        currentTab={currentTab === 'detail' ? 'booking' : currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        bookingCount={activeCount}
      />

      {/* Main Body */}
      <main className="flex-1">
        
        {/* TAB 1: HOME */}
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

        {/* TAB 2: BOOKING */}
        {currentTab === 'booking' && (
          <StitchBooking
            initialService={selectedService}
            onBookingSuccess={handleBookingCreated}
            onBack={() => {
              setCurrentTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* TAB 3: APPOINTMENT DETAIL (VÉ HẸN) */}
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

        {/* TAB 4: MY APPOINTMENTS */}
        {currentTab === 'appointments' && (
          <StitchAppointmentList
            bookings={bookings}
            onSelectBooking={(b) => {
              setActiveBooking(b);
              setCurrentTab('detail');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            isStaffMode={false}
          />
        )}

        {/* TAB 5: STAFF DISPATCH */}
        {currentTab === 'staff' && (
          <StitchAppointmentList
            bookings={bookings}
            onSelectBooking={(b) => {
              setActiveBooking(b);
              setCurrentTab('detail');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onUpdateStatus={handleUpdateStatus}
            isStaffMode={true}
          />
        )}

      </main>

      {/* Review Modal */}
      <StitchReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        bookingCode={activeBooking?.bookingCode}
      />

      {/* Floating GA4 Live Inspector */}
      <AnalyticsInspector />

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <BottomNavBar
        currentTab={currentTab === 'detail' ? 'booking' : currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        bookingCount={activeCount}
      />

    </div>
  );
}

export default App;
