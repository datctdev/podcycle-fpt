import React, { useState, useEffect } from 'react';
import { 
  Booking, 
  BookingStatus, 
  User, 
  ClinicalChecklistBefore, 
  ClinicalChecklistAfter 
} from '../types';
import { CAMPUSES } from '../services/dataInit';
import { playStationNotification } from '../utils/sound';
import { DatabaseService } from '../services/db';

interface TechnicianWorkspaceProps {
  currentUser: User;
  bookings: Booking[];
  onUpdateStatus: (bookingId: string, newStatus: BookingStatus, updates?: Partial<Booking>) => void;
  onOpenReceipt: (booking: Booking) => void;
  onSwitchToStudentView: () => void;
  onLogout: () => void;
}

export const TechnicianWorkspace: React.FC<TechnicianWorkspaceProps> = ({
  currentUser,
  bookings,
  onUpdateStatus,
  onOpenReceipt,
  onSwitchToStudentView,
  onLogout
}) => {
  const [selectedCampus, setSelectedCampus] = useState(CAMPUSES[0].id);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scanCodeInput, setScanCodeInput] = useState('');
  
  // Checklist Before Modal (Giai đoạn 3)
  const [activeChecklistBeforeBooking, setActiveChecklistBeforeBooking] = useState<Booking | null>(null);
  const [serialInput, setSerialInput] = useState('');
  const [scratchesLevel, setScratchesLevel] = useState<'NONE' | 'LIGHT' | 'HEAVY'>('LIGHT');
  const [grimeLevel, setGrimeLevel] = useState<'LIGHT' | 'MEDIUM' | 'SEVERE'>('MEDIUM');
  const [leftSpeakerPass, setLeftSpeakerPass] = useState(true);
  const [rightSpeakerPass, setRightSpeakerPass] = useState(true);
  const [micPass, setMicPass] = useState(true);
  const [scopeLockActive, setScopeLockActive] = useState(false);
  const [scopeLockReasonInput, setScopeLockReasonInput] = useState('Chập nguồn dock sạc / liệt chip âm sâu bên trong');
  const [customerAgreedBefore, setCustomerAgreedBefore] = useState(true);
  const [tempBeforePhoto, setTempBeforePhoto] = useState<string>('');

  // Checklist After Modal (Giai đoạn 5)
  const [activeChecklistAfterBooking, setActiveChecklistAfterBooking] = useState<Booking | null>(null);
  const [meshClearancePass, setMeshClearancePass] = useState(true);
  const [balanceLRPass, setBalanceLRPass] = useState(true);
  const [micClarityPass, setMicClarityPass] = useState(true);
  const [visualCleanPass, setVisualCleanPass] = useState(true);
  const [customerTestedAtCounter, setCustomerTestedAtCounter] = useState(true);
  const [tempAfterPhoto, setTempAfterPhoto] = useState<string>('');

  // Ticking timer for 30min countdowns
  const [nowTimestamp, setNowTimestamp] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNowTimestamp(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter bookings for current station
  const stationBookings = bookings.filter((b) => {
    const matchSearch =
      b.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.phone.includes(searchTerm) ||
      (b.studentId && b.studentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.serialNumber && b.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchSearch;
  });

  // Pipeline columns (Chuẩn 6 Giai Đoạn)
  // Cột 1: Chờ tiếp nhận (PENDING_PAYMENT, PENDING, CONFIRMED)
  const pendingList = stationBookings.filter(
    (b) => b.status === 'PENDING' || b.status === 'PENDING_PAYMENT' || b.status === 'CONFIRMED'
  );

  // Cột 2: Đang vệ sinh 30p (CHECKED_IN, PROCESSING, CLEANING)
  const cleaningList = stationBookings.filter(
    (b) => b.status === 'CHECKED_IN' || b.status === 'PROCESSING' || b.status === 'CLEANING'
  );

  // Cột 3: Sẵn sàng test âm & bàn giao (READY_FOR_PICKUP, READY)
  const readyList = stationBookings.filter(
    (b) => b.status === 'READY_FOR_PICKUP' || b.status === 'READY'
  );

  // Cột 4: Hoàn thành hoặc Scope Lock Hoàn tiền (COMPLETED, REFUNDED)
  const completedList = stationBookings.filter(
    (b) => b.status === 'COMPLETED' || b.status === 'REFUNDED'
  );

  // Revenue
  const revenue = stationBookings
    .filter((b) => b.status === 'COMPLETED' || b.paymentStatus === 'PAID')
    .reduce((sum, b) => sum + b.amount, 0);

  // Kiểm tra đơn đã thanh toán hợp lệ chưa (Bắt buộc theo SOP O2O)
  const isBookingPaid = (b: Booking): boolean => {
    return b.paymentStatus === 'PAID' || (b.status !== 'PENDING_PAYMENT' && b.status !== 'PENDING');
  };

  // KTV chủ động đối soát và xác nhận thanh toán tại bàn trực khi khách hàng chứng minh đã chuyển khoản SePay
  const handleConfirmPaymentAtCounter = (booking: Booking) => {
    const confirm = window.confirm(
      `XÁC NHẬN ĐỐI SOÁT THANH TOÁN TẠI QUẦY?\n\n` +
      `Mã đơn: ${booking.bookingCode}\n` +
      `Khách hàng: ${booking.customerName} (${booking.phone})\n` +
      `Số tiền: ${booking.amount.toLocaleString('vi-VN')}đ\n\n` +
      `Bạn chắc chắn đã kiểm tra sao kê SePay (hoặc màn hình chuyển khoản của sinh viên) đã nhận đủ ${booking.amount.toLocaleString('vi-VN')}đ?`
    );
    if (!confirm) return;

    // Ghi nhận giao dịch vào bảng transactions
    DatabaseService.recordTransaction({
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      amount: booking.amount,
      paymentMethod: 'SEPAY_PG',
      referenceNumber: 'KTV_COUNTER_VERIFIED'
    });

    onUpdateStatus(booking.id, 'CONFIRMED', {
      paymentStatus: 'PAID'
    });

    playStationNotification('complete');
  };

  // 1. Quét mã QR check-in
  const handleQuickCheckinScan = (codeToFind?: string) => {
    const code = (codeToFind || scanCodeInput).trim().toUpperCase();
    if (!code) return;

    const cleanCode = code.replace(/^TICKET-?/i, '');
    const found = bookings.find(
      (b) => b.bookingCode.toUpperCase() === cleanCode || b.bookingCode.toUpperCase() === code
    );

    if (found) {
      // VALIDATE NGHIÊM NGẶT: Chặn KTV nhận máy nếu đơn chưa thanh toán
      if (!isBookingPaid(found)) {
        playStationNotification('alert');
        alert(
          `⛔ [TỪ CHỐI CHECK-IN] ĐƠN HÀNG CHƯA THANH TOÁN!\n\n` +
          `Mã đơn: ${found.bookingCode}\n` +
          `Khách hàng: ${found.customerName} (${found.phone})\n` +
          `Số tiền cần thanh toán: ${found.amount.toLocaleString('vi-VN')}đ\n\n` +
          `Theo quy định SOP trạm O2O Station, Kỹ thuật viên KHÔNG ĐƯỢC PHÉP tiếp nhận thiết bị khi đơn hàng chưa hoàn tất thanh toán qua Cổng SePay.\n\n` +
          `Vui lòng yêu cầu sinh viên hoàn tất thanh toán trên điện thoại, hoặc KTV kiểm tra sao kê SePay và bấm nút "Đối Soát Đã Nhận Tiền" tại bàn trực.`
        );
        return;
      }

      playStationNotification('complete');
      setIsScanModalOpen(false);
      setScanCodeInput('');
      openChecklistBeforeModal(found);
    } else {
      alert(`Không tìm thấy đơn hàng có mã: ${code}`);
    }
  };

  // Mở modal đồng kiểm Before
  const openChecklistBeforeModal = (booking: Booking) => {
    if (!isBookingPaid(booking)) {
      playStationNotification('alert');
      alert(`⛔ [TỪ CHỐI] Đơn hàng ${booking.bookingCode} chưa thanh toán! Không thể mở biên bản khám lâm sàng.`);
      return;
    }

    setActiveChecklistBeforeBooking(booking);
    setSerialInput(booking.serialNumber || '');
    setScratchesLevel(booking.checklistBefore?.caseScratches || 'LIGHT');
    setGrimeLevel(booking.checklistBefore?.earpieceGrime || 'MEDIUM');
    setLeftSpeakerPass(booking.checklistBefore?.leftSpeakerWorking ?? true);
    setRightSpeakerPass(booking.checklistBefore?.rightSpeakerWorking ?? true);
    setMicPass(booking.checklistBefore?.micWorking ?? true);
    setScopeLockActive(Boolean(booking.scopeLockReason));
    setCustomerAgreedBefore(true);
    setTempBeforePhoto(booking.beforePhoto || '');
  };

  // Lưu biên bản Before & Chuyển sang PROCESSING (hoặc SCOPE LOCK)
  const handleConfirmChecklistBefore = () => {
    if (!activeChecklistBeforeBooking) return;

    if (scopeLockActive) {
      // Scope Lock: Từ chối & hoàn tiền 100%
      onUpdateStatus(activeChecklistBeforeBooking.id, 'REFUNDED', {
        paymentStatus: 'REFUNDED',
        scopeLockReason: scopeLockReasonInput,
        refundReason: 'Scope Lock: Lỗi sâu phần cứng (chập nguồn/hỏng chip âm). Cam kết hoàn phí 100%.',
        refundedAt: new Date().toISOString()
      });
      playStationNotification('complete');
      setActiveChecklistBeforeBooking(null);
      return;
    }

    const checklist: ClinicalChecklistBefore = {
      serialNumber: serialInput.trim() || 'SN-AIRPODS-' + Math.floor(1000 + Math.random() * 9000),
      caseScratches: scratchesLevel,
      earpieceGrime: grimeLevel,
      leftSpeakerWorking: leftSpeakerPass,
      rightSpeakerWorking: rightSpeakerPass,
      micWorking: micPass,
      customerAgreed: customerAgreedBefore,
      checkedAt: new Date().toISOString(),
      technicianName: currentUser.fullName
    };

    onUpdateStatus(activeChecklistBeforeBooking.id, 'PROCESSING', {
      technicianName: currentUser.fullName,
      serialNumber: checklist.serialNumber,
      checklistBefore: checklist,
      beforePhoto: tempBeforePhoto || activeChecklistBeforeBooking.beforePhoto || '/clean-airpods.png',
      cleaningStartedAt: new Date().toISOString()
    });

    playStationNotification('complete');
    setActiveChecklistBeforeBooking(null);
  };

  // Mở modal kiểm thử QA After
  const openChecklistAfterModal = (booking: Booking) => {
    setActiveChecklistAfterBooking(booking);
    setMeshClearancePass(true);
    setBalanceLRPass(true);
    setMicClarityPass(true);
    setVisualCleanPass(true);
    setCustomerTestedAtCounter(true);
    setTempAfterPhoto(booking.afterPhoto || '');
  };

  // Lưu biên bản QA After & Chuyển sang READY_FOR_PICKUP
  const handleConfirmChecklistAfter = () => {
    if (!activeChecklistAfterBooking) return;

    // Tính điểm âm học
    let score = 85;
    if (meshClearancePass) score += 4;
    if (balanceLRPass) score += 4;
    if (micClarityPass) score += 3;
    if (visualCleanPass) score += 2;

    const checklistAfter: ClinicalChecklistAfter = {
      meshClearance: meshClearancePass,
      balanceLR: balanceLRPass,
      micClarity: micClarityPass,
      visualCleanliness: visualCleanPass,
      soundScore: score,
      customerTestedAtCounter: customerTestedAtCounter,
      satisfactionAgreed: true,
      completedAt: new Date().toISOString(),
      testedBy: currentUser.fullName
    };

    onUpdateStatus(activeChecklistAfterBooking.id, 'READY_FOR_PICKUP', {
      checklistAfter: checklistAfter,
      soundClarityScore: score,
      afterPhoto: tempAfterPhoto || activeChecklistAfterBooking.afterPhoto || '/clean-airpods.png'
    });

    playStationNotification('complete');
    setActiveChecklistAfterBooking(null);
  };

  // Khách nghiệm thu tại quầy & Bàn giao (COMPLETED)
  const handleFinalHandover = (booking: Booking) => {
    // Ngày bảo dưỡng định kỳ sau 3 tháng
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 90);
    const nextDateStr = nextDate.toISOString().split('T')[0];

    onUpdateStatus(booking.id, 'COMPLETED', {
      completedAt: new Date().toISOString(),
      paymentStatus: 'PAID',
      nextMaintenanceDate: nextDateStr
    });

    playStationNotification('complete');
  };

  // Helper nén ảnh bằng HTML5 Canvas xuống < 150KB trước khi lưu vào Database
  const compressImageFile = (file: File, maxDim = 1000, quality = 0.75): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(event.target?.result as string);
        img.src = event.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Upload photo handler với tính năng tự động nén ảnh chống tràn Database
  const handleUploadPhoto = async (
    bookingId: string,
    photoType: 'beforePhoto' | 'afterPhoto',
    e: React.ChangeEvent<HTMLInputElement>,
    setter?: (b64: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressedBase64 = await compressImageFile(file);
      if (setter) {
        setter(compressedBase64);
      } else {
        onUpdateStatus(bookingId, bookings.find((b) => b.id === bookingId)?.status || 'PROCESSING', {
          [photoType]: compressedBase64
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1c30] text-slate-100 flex flex-col font-sans">
      
      {/* 1. TOP TECHNICIAN WORKSPACE BAR */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-lg">
        
        {/* Left: Station Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f26f21] to-[#ffb693] flex items-center justify-center text-white font-bold shadow-md shadow-orange-500/20">
            <span className="material-symbols-outlined text-[22px]">build_circle</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-extrabold text-base tracking-tight text-white">
                WORK SPACE KỸ THUẬT VIÊN (SOP 6 GIAI ĐOẠN)
              </h1>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Trạm O2O Đang Trực</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              KTV Trưởng ca: <strong className="text-white">{currentUser.fullName}</strong> • {currentUser.studentId || 'TECH-01'}
            </p>
          </div>
        </div>

        {/* Center: Quick QR Scan Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsScanModalOpen(true)}
            className="bg-[#f26f21] hover:bg-[#e05e10] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
            <span>Quét Mã Vé Hẹn Check-in</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">

          <button
            onClick={onSwitchToStudentView}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px] text-[#f26f21]">visibility</span>
            <span>Xem Giao Diện Sinh Viên</span>
          </button>

          <button
            onClick={onLogout}
            title="Đăng xuất"
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-xl border border-red-500/30 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>

      </header>

      {/* 2. STATION METRICS BAR */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">1. Chờ tiếp nhận:</span>
              <span className="bg-amber-500/20 text-amber-300 font-mono font-bold px-2 py-0.5 rounded border border-amber-500/30">
                {pendingList.length} máy
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">2. Đang vệ sinh 30p:</span>
              <span className="bg-purple-500/20 text-purple-300 font-mono font-bold px-2 py-0.5 rounded border border-purple-500/30 animate-pulse">
                {cleaningList.length} máy
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">3. Chờ test âm & trả:</span>
              <span className="bg-blue-500/20 text-blue-300 font-mono font-bold px-2 py-0.5 rounded border border-blue-500/30">
                {readyList.length} máy
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">4. Đã hoàn thành:</span>
              <span className="bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                {completedList.length} máy
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Doanh Thu Thực Tế Ca Trực</span>
              <span className="font-heading font-extrabold text-base text-[#10B981]">
                {revenue.toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. MAIN WORKSPACE KANBAN PIPELINE (4 CỘT CHUẨN 6 GIAI ĐOẠN) */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Search & SOP Info Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm theo Mã đơn, Serial, Họ tên, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#f26f21]"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Quy trình chuẩn hóa:</span>
            <span className="text-[#f26f21] font-bold">
              Quét QR ➔ Đồng kiểm Before (Serial) ➔ Vệ sinh 30p ➔ Đo lường After ➔ Test âm & E-Receipt
            </span>
          </div>
        </div>

        {/* 4-COLUMN KANBAN PIPELINE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* CỘT 1: CHỜ TIẾP NHẬN & ĐỒNG KIỂM BEFORE */}
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-3 flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="font-heading font-bold text-xs text-slate-200 uppercase">
                  1. Chờ Khách Tới Bàn ({pendingList.length})
                </span>
              </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[620px] pr-1">
              {pendingList.length === 0 ? (
                <div className="text-center py-10 text-slate-600 text-xs">
                  Không có đơn nào chờ tiếp nhận
                </div>
              ) : (
                pendingList.map((b) => (
                  <div
                    key={b.id}
                    className="bg-slate-800/90 rounded-xl p-3.5 border border-slate-700/80 space-y-2.5 shadow-xs"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-heading font-bold text-xs text-[#ffb693] font-mono">
                        {b.bookingCode}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {b.paymentStatus === 'PAID' ? (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[11px]">verified</span>
                            <span>SePay Đã TT</span>
                          </span>
                        ) : (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-medium">
                            Chờ TT
                          </span>
                        )}
                        <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-medium">
                          {b.deviceModel}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300">
                      <p className="font-bold text-white">{b.customerName}</p>
                      <p className="text-[11px] text-slate-400">{b.phone} • {b.studentId}</p>
                      <p className="text-[11px] text-amber-400 mt-0.5">Hẹn: {b.bookingDate} ({b.slotTime})</p>
                    </div>

                    {b.issueNote && (
                      <p className="text-[10px] text-slate-400 bg-slate-900/60 p-1.5 rounded border border-slate-700/50">
                        {b.issueNote}
                      </p>
                    )}

                    {isBookingPaid(b) ? (
                      <button
                        onClick={() => openChecklistBeforeModal(b)}
                        className="w-full bg-[#f26f21] hover:bg-[#e05e10] text-white text-xs font-bold py-2 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">clinical_notes</span>
                        <span>Khám Lâm Sàng & Nhận Máy</span>
                      </button>
                    ) : (
                      <div className="space-y-1.5 pt-1">
                        <div className="p-2 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-[11px] flex items-start gap-1.5">
                          <span className="material-symbols-outlined text-[14px] text-red-400 shrink-0 mt-0.5">lock</span>
                          <span><strong>Chưa thanh toán:</strong> Không được nhận máy. Yêu cầu khách hoàn tất SePay.</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          <button
                            disabled
                            className="w-full bg-slate-800 text-slate-500 text-[11px] font-bold py-2 rounded-lg cursor-not-allowed flex items-center justify-center gap-1 border border-slate-700/60 opacity-60"
                            title="Khách chưa thanh toán - Khóa tiếp nhận"
                          >
                            <span className="material-symbols-outlined text-[15px]">block</span>
                            <span>Khóa Nhận Máy</span>
                          </button>

                          <button
                            onClick={() => handleConfirmPaymentAtCounter(b)}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs border border-blue-400/40"
                            title="KTV bấm sau khi kiểm tra sao kê SePay (VD: thấy biến động +90k như trên web SePay)"
                          >
                            <span className="material-symbols-outlined text-[15px]">verified</span>
                            <span>Đối Soát Đã Nhận Tiền</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* CỘT 2: ĐANG VỆ SINH CHUYÊN SÂU 30 PHÚT (COUNTDOWN TIMER) */}
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-3 flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse"></span>
                <span className="font-heading font-bold text-xs text-slate-200 uppercase">
                  2. Đang Vệ Sinh 30p ({cleaningList.length})
                </span>
              </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[620px] pr-1">
              {cleaningList.length === 0 ? (
                <div className="text-center py-10 text-slate-600 text-xs">
                  Hiện không có máy đang xử lý
                </div>
              ) : (
                cleaningList.map((b) => {
                  // Tính đếm ngược 30 phút từ cleaningStartedAt
                  const startTime = b.cleaningStartedAt ? new Date(b.cleaningStartedAt).getTime() : nowTimestamp;
                  const elapsedMs = Math.max(0, nowTimestamp - startTime);
                  const totalMs = 30 * 60 * 1000;
                  const remainingMs = Math.max(0, totalMs - elapsedMs);
                  const remMinutes = Math.floor(remainingMs / 60000);
                  const remSeconds = Math.floor((remainingMs % 60000) / 1000);

                  return (
                    <div
                      key={b.id}
                      className="bg-slate-800/90 rounded-xl p-3.5 border border-purple-500/40 space-y-2.5 shadow-xs ring-1 ring-purple-500/20"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-heading font-bold text-xs text-[#ffb693] font-mono">
                          {b.bookingCode}
                        </span>
                        
                        {/* Countdown Timer Badge */}
                        <span className="text-[11px] bg-purple-500/30 text-purple-200 font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-purple-400/40">
                          <span className="material-symbols-outlined text-[13px] animate-spin">timer</span>
                          <span>{String(remMinutes).padStart(2, '0')}:{String(remSeconds).padStart(2, '0')}</span>
                        </span>
                      </div>

                      <div className="text-xs text-slate-300">
                        <p className="font-bold text-white">{b.customerName} ({b.deviceModel})</p>
                        <p className="text-[11px] text-slate-400">Serial: <span className="font-mono text-purple-300">{b.serialNumber || 'Chưa ghi'}</span></p>
                        <p className="text-[11px] text-slate-400">KTV phụ trách: {b.technicianName || currentUser.fullName}</p>
                      </div>

                      {/* SOP Safety Guidelines */}
                      <div className="bg-slate-900/80 p-2 rounded-lg space-y-1 text-[11px] text-slate-400 border border-slate-700/60">
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <span className="material-symbols-outlined text-[14px]">check_box</span>
                          <span>Hút bụi mịn hốc sạc & bọc kín chân sạc</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <span className="material-symbols-outlined text-[14px]">check_box</span>
                          <span>Rã cáu cặn màng loa bằng tăm ẩm bay hơi</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-amber-300">
                          <span className="material-symbols-outlined text-[14px]">shield</span>
                          <span>An toàn: Không để chất lỏng vào màng lưới</span>
                        </div>
                      </div>

                      <button
                        onClick={() => openChecklistAfterModal(b)}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        <span>Đo Lường Sau Xử Lý (Checklist After)</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* CỘT 3: TEST ÂM LÂM SÀNG & BÀN GIAO MÁY */}
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-3 flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                <span className="font-heading font-bold text-xs text-slate-200 uppercase">
                  3. Test Âm & Trả Máy ({readyList.length})
                </span>
              </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[620px] pr-1">
              {readyList.length === 0 ? (
                <div className="text-center py-10 text-slate-600 text-xs">
                  Không có máy chờ trả
                </div>
              ) : (
                readyList.map((b) => (
                  <div
                    key={b.id}
                    className="bg-slate-800/90 rounded-xl p-3.5 border border-blue-500/40 space-y-2.5 shadow-xs"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-heading font-bold text-xs text-blue-300 font-mono">
                        {b.bookingCode}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                          Âm: {b.soundClarityScore || 98}%
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300">
                      <p className="font-bold text-white">{b.customerName} ({b.phone})</p>
                      <p className="text-[11px] text-slate-400">{b.deviceModel} • {b.serviceName}</p>
                    </div>

                    <div className="bg-slate-900/70 p-2 rounded-lg text-[11px] text-slate-300 space-y-1">
                      <p className="text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">headphones</span>
                        <span>Sinh viên đeo test trực tiếp tại quầy</span>
                      </p>
                      <p className="text-slate-400 text-[10px]">
                        Khách kiểm tra độ cân bằng âm 2 bên và soi đèn màng loa sạch cặn trước khi ký bàn giao.
                      </p>
                    </div>

                    <button
                      onClick={() => handleFinalHandover(b)}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                      <span>Khách Test Đạt Chuẩn ➔ Ký Nghiệm Thu</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* CỘT 4: HOÀN TẤT & E-RECEIPT (LỊCH SỬ 3 THÁNG) */}
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-3 flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span className="font-heading font-bold text-xs text-slate-200 uppercase">
                  4. Đã Hoàn Tất ({completedList.length})
                </span>
              </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[620px] pr-1">
              {completedList.length === 0 ? (
                <div className="text-center py-10 text-slate-600 text-xs">
                  Chưa có đơn hoàn thành trong ca
                </div>
              ) : (
                completedList.map((b) => (
                  <div
                    key={b.id}
                    className="bg-slate-800/90 rounded-xl p-3.5 border border-slate-700/60 space-y-2 shadow-xs"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-heading font-bold text-xs text-slate-300 font-mono">
                        {b.bookingCode}
                      </span>
                      {b.status === 'REFUNDED' ? (
                        <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded font-bold">
                          Scope Lock (Hoàn 100%)
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">
                          Đã Hoàn Tất
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-300">
                      <p className="font-bold text-white">{b.customerName}</p>
                      <p className="text-[11px] text-slate-400">{b.amount.toLocaleString('vi-VN')}đ • {b.deviceModel}</p>
                      {b.nextMaintenanceDate && (
                        <p className="text-[10px] text-emerald-400 mt-1">
                          ⏰ Hẹn nhắc vệ sinh: {b.nextMaintenanceDate}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => onOpenReceipt(b)}
                      className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px] text-[#ffb693]">receipt_long</span>
                      <span>Biên Nhận Điện Tử E-Receipt</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </main>

      {/* ============================================================== */}
      {/* MODAL 1: QUÉT MÃ QR CHECK-IN NHANH TẠI BÀN TRỰC */}
      {/* ============================================================== */}
      {isScanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f26f21] text-[22px]">qr_code_scanner</span>
                <h3 className="font-heading font-bold text-sm text-white">Quét Mã QR Vé Hẹn Check-in</h3>
              </div>
              <button
                onClick={() => setIsScanModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Nhập hoặc quét mã trên Vé Hẹn Điện Tử của sinh viên (Ví dụ: <code className="text-[#ffb693]">TTN-8821</code>) để thực hiện Check-in và mở biên bản khám lâm sàng đầu vào.
            </p>

            <div className="space-y-2">
              <input
                type="text"
                autoFocus
                placeholder="Nhập mã đơn TTN-xxxx..."
                value={scanCodeInput}
                onChange={(e) => setScanCodeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickCheckinScan()}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-[#f26f21]"
              />
            </div>

            {/* Quick Suggestions from pending list */}
            {pendingList.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Khách đang có lịch hẹn:</span>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {pendingList.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleQuickCheckinScan(p.bookingCode)}
                      className="bg-slate-800 hover:bg-slate-700 text-xs px-2.5 py-1 rounded-lg text-slate-200 border border-slate-700 font-mono transition-colors cursor-pointer"
                    >
                      {p.bookingCode} ({p.customerName})
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsScanModalOpen(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2.5 rounded-xl cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => handleQuickCheckinScan()}
                className="flex-1 bg-[#f26f21] hover:bg-[#e05e10] text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Xác Nhận Check-in
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: BIÊN BẢN ĐỒNG KIỂM LÂM SÀNG BEFORE (GIAI ĐOẠN 3) */}
      {/* ============================================================== */}
      {activeChecklistBeforeBooking && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#f26f21] tracking-wider block">GIAI ĐOẠN 3: TIẾP NHẬN TẠI BÀN TRỰC</span>
                <h3 className="font-heading font-extrabold text-base text-white">Biên Bản Đồng Kiểm Lâm Sàng Đầu Vào</h3>
              </div>
              <button
                onClick={() => setActiveChecklistBeforeBooking(null)}
                className="text-slate-400 hover:text-white p-1 rounded-full cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 text-xs space-y-1">
              <p><strong className="text-white">Mã đơn:</strong> <span className="font-mono text-[#ffb693]">{activeChecklistBeforeBooking.bookingCode}</span> • {activeChecklistBeforeBooking.deviceModel}</p>
              <p><strong className="text-white">Khách hàng:</strong> {activeChecklistBeforeBooking.customerName} ({activeChecklistBeforeBooking.phone})</p>
              <p className="text-slate-400">Hiện trạng khách báo: <em>"{activeChecklistBeforeBooking.issueNote}"</em></p>
            </div>

            {/* 1. Serial Number */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-300 block">1. Đối chiếu & Ghi nhận số Serial máy:</label>
              <input
                type="text"
                placeholder="Ví dụ: H12345ABCDE (xem trong nắp dock sạc)"
                value={serialInput}
                onChange={(e) => setSerialInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-[#f26f21]"
              />
            </div>

            {/* 2. Ngoại quan */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Vết trầy xước vỏ case:</label>
                <select
                  value={scratchesLevel}
                  onChange={(e) => setScratchesLevel(e.target.value as any)}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                >
                  <option value="NONE">Không trầy xước (Như mới)</option>
                  <option value="LIGHT">Xước lông mèo nhẹ</option>
                  <option value="HEAVY">Trầy xước sâu / Cấn móp</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Cáu cặn bám màng loa:</label>
                <select
                  value={grimeLevel}
                  onChange={(e) => setGrimeLevel(e.target.value as any)}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                >
                  <option value="LIGHT">Bụi bẩn nhẹ</option>
                  <option value="MEDIUM">Cáu cặn bám két vừa</option>
                  <option value="SEVERE">Cáu cặn bít kín màng loa</option>
                </select>
              </div>
            </div>

            {/* 3. Test âm thanh lâm sàng đầu vào */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-300 block">2. Test âm thanh lâm sàng trước khi làm sạch:</label>
              <div className="grid grid-cols-3 gap-2">
                <label className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer ${leftSpeakerPass ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-rose-950/40 border-rose-500/50 text-rose-300'}`}>
                  <span>Loa Trái (L)</span>
                  <input
                    type="checkbox"
                    checked={leftSpeakerPass}
                    onChange={(e) => setLeftSpeakerPass(e.target.checked)}
                    className="accent-emerald-500"
                  />
                </label>

                <label className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer ${rightSpeakerPass ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-rose-950/40 border-rose-500/50 text-rose-300'}`}>
                  <span>Loa Phải (R)</span>
                  <input
                    type="checkbox"
                    checked={rightSpeakerPass}
                    onChange={(e) => setRightSpeakerPass(e.target.checked)}
                    className="accent-emerald-500"
                  />
                </label>

                <label className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer ${micPass ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-rose-950/40 border-rose-500/50 text-rose-300'}`}>
                  <span>Micro</span>
                  <input
                    type="checkbox"
                    checked={micPass}
                    onChange={(e) => setMicPass(e.target.checked)}
                    className="accent-emerald-500"
                  />
                </label>
              </div>
            </div>

            {/* 4. Chụp ảnh hiện trạng Before */}
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f26f21]">photo_camera</span>
                <span>{tempBeforePhoto ? '✓ Đã chụp ảnh màng loa đầu vào' : 'Chưa có ảnh đầu vào'}</span>
              </div>
              <label className="bg-slate-700 hover:bg-slate-600 text-[#ffb693] font-bold px-3 py-1.5 rounded-lg border border-slate-600 cursor-pointer text-xs">
                <span>{tempBeforePhoto ? 'Đổi ảnh' : 'Chụp/Tải ảnh'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUploadPhoto(activeChecklistBeforeBooking.id, 'beforePhoto', e, setTempBeforePhoto)}
                />
              </label>
            </div>

            {/* 5. SCOPE LOCK WARNING */}
            <div className={`p-3 rounded-xl border text-xs space-y-2 transition-all ${scopeLockActive ? 'bg-rose-950/60 border-rose-500 text-rose-200' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-rose-400">
                  <span className="material-symbols-outlined text-[16px]">lock_clock</span>
                  <span>Scope Lock (Từ chối nhận máy & Hoàn phí)</span>
                </span>
                <input
                  type="checkbox"
                  checked={scopeLockActive}
                  onChange={(e) => setScopeLockActive(e.target.checked)}
                  className="accent-rose-500 w-4 h-4 cursor-pointer"
                />
              </div>
              {scopeLockActive && (
                <div className="space-y-1 pt-1 border-t border-rose-800/50">
                  <p className="text-[11px] text-rose-300">
                    Kích hoạt khi máy bị chập nguồn, liệt cảm ứng sâu hoặc hỏng chip âm thanh phần cứng. Hệ thống sẽ hủy đơn và hoàn tiền 100% về tài khoản sinh viên.
                  </p>
                  <input
                    type="text"
                    value={scopeLockReasonInput}
                    onChange={(e) => setScopeLockReasonInput(e.target.value)}
                    className="w-full p-2 bg-slate-900 border border-rose-500/50 rounded-lg text-xs text-white"
                  />
                </div>
              )}
            </div>

            {/* Khách hàng đồng ý */}
            {!scopeLockActive && (
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-2 bg-slate-800/50 rounded-xl">
                <input
                  type="checkbox"
                  checked={customerAgreedBefore}
                  onChange={(e) => setCustomerAgreedBefore(e.target.checked)}
                  className="accent-[#f26f21] w-4 h-4"
                />
                <span>Khách hàng đã ký xác nhận tình trạng lâm sàng đầu vào tại bàn trực.</span>
              </label>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveChecklistBeforeBooking(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2.5 rounded-xl cursor-pointer"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={handleConfirmChecklistBefore}
                className={`flex-1 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer ${scopeLockActive ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-[#f26f21] hover:bg-[#e05e10] text-white shadow-md'}`}
              >
                {scopeLockActive ? 'Kích Hoạt Scope Lock & Hoàn Phí' : 'Xác Nhận Bàn Giao ➔ Bắt Đầu Vệ Sinh'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: BIÊN BẢN KIỂM THỬ ĐO LƯỜNG SAU XỬ LÝ (GIAI ĐOẠN 5) */}
      {/* ============================================================== */}
      {activeChecklistAfterBooking && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block">GIAI ĐOẠN 5: KIỂM THỬ CHẤT LƯỢNG (QA)</span>
                <h3 className="font-heading font-extrabold text-base text-white">Biên Bản Đo Lường & Test Âm Sau 30 Phút</h3>
              </div>
              <button
                onClick={() => setActiveChecklistAfterBooking(null)}
                className="text-slate-400 hover:text-white p-1 rounded-full cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-300 block">Các tiêu chí kiểm thử đạt chuẩn:</span>
              
              <div className="space-y-2">
                <label className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/80 flex items-center justify-between cursor-pointer">
                  <span>1. Độ thông thoáng màng loa ngoài và hốc thoát âm</span>
                  <input
                    type="checkbox"
                    checked={meshClearancePass}
                    onChange={(e) => setMeshClearancePass(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4"
                  />
                </label>

                <label className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/80 flex items-center justify-between cursor-pointer">
                  <span>2. Cân bằng âm lượng 2 bên (Equal Sound Balance L/R)</span>
                  <input
                    type="checkbox"
                    checked={balanceLRPass}
                    onChange={(e) => setBalanceLRPass(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4"
                  />
                </label>

                <label className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/80 flex items-center justify-between cursor-pointer">
                  <span>3. Độ nhạy và khử ồn của micro sau khi hút bụi</span>
                  <input
                    type="checkbox"
                    checked={micClarityPass}
                    onChange={(e) => setMicClarityPass(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4"
                  />
                </label>

                <label className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/80 flex items-center justify-between cursor-pointer">
                  <span>4. Soi đèn màng loa sạch bóng, không còn cặn bám két</span>
                  <input
                    type="checkbox"
                    checked={visualCleanPass}
                    onChange={(e) => setVisualCleanPass(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4"
                  />
                </label>
              </div>
            </div>

            {/* Chụp ảnh màng loa sạch After */}
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">verified</span>
                <span>{tempAfterPhoto ? '✓ Đã chụp ảnh sạch sau 30 phút' : 'Chưa có ảnh sau vệ sinh'}</span>
              </div>
              <label className="bg-slate-700 hover:bg-slate-600 text-emerald-400 font-bold px-3 py-1.5 rounded-lg border border-slate-600 cursor-pointer text-xs">
                <span>{tempAfterPhoto ? 'Đổi ảnh' : 'Chụp/Tải ảnh'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUploadPhoto(activeChecklistAfterBooking.id, 'afterPhoto', e, setTempAfterPhoto)}
                />
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveChecklistAfterBooking(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2.5 rounded-xl cursor-pointer"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={handleConfirmChecklistAfter}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Đạt Chuẩn QA ➔ Mời Khách Nhận Máy
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
