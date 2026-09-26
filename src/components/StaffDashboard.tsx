import React, { useState } from 'react';
import { Booking, BookingStatus } from '../types';
import { 
  CheckCircle2, Clock, Smartphone, Search, RefreshCw, 
  ArrowRight, ShieldCheck, AlertCircle, Sparkles, Filter 
} from 'lucide-react';

interface StaffDashboardProps {
  bookings: Booking[];
  onUpdateStatus: (bookingId: string, newStatus: BookingStatus) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ bookings, onUpdateStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    const matchSearch = 
      b.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.phone.includes(searchTerm) ||
      (b.studentId && b.studentId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStatus = filterStatus === 'ALL' || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Calculate statistics
  const totalRevenue = bookings.reduce((sum, b) => sum + b.amount, 0);
  const activeCount = bookings.filter(b => b.status === 'CLEANING' || b.status === 'CHECKED_IN').length;
  const completedCount = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'READY').length;

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">Chờ Khách Bàn Giao</span>;
      case 'CHECKED_IN':
        return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full">Đã Nhận Máy</span>;
      case 'CLEANING':
        return <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><Sparkles className="w-3 h-3 animate-spin"/> Đang Vệ Sinh 30p</span>;
      case 'READY':
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">Sẵn Sàng Trả Máy</span>;
      case 'COMPLETED':
        return <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full">Hoàn Thành & Đã Giao</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
            <h1 className="text-2xl font-bold text-slate-900">Bảng Điều Phối Trạm Sảnh Tự Học</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">Dành riêng cho nhân viên kỹ thuật trực tiếp tại campus trường học</p>
        </div>

        {/* Quick metrics */}
        <div className="flex items-center gap-3">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs text-right">
            <span className="text-xs text-slate-500 block">Đang xử lý</span>
            <span className="text-lg font-bold text-purple-600">{activeCount} máy</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs text-right">
            <span className="text-xs text-slate-500 block">Tổng doanh thu ca</span>
            <span className="text-lg font-bold text-emerald-600">{totalRevenue.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Tìm theo Mã đơn (#TTN-xxxx), Tên sinh viên, Số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['ALL', 'PENDING', 'CHECKED_IN', 'CLEANING', 'READY', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                filterStatus === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st === 'ALL' ? 'Tất cả' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table / Cards */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-base font-medium">Không tìm thấy đơn đặt lịch nào phù hợp.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredBookings.map((b) => (
              <div key={b.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Left: Booking Details */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-base">{b.bookingCode}</span>
                    {getStatusBadge(b.status)}
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {b.deviceModel}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                      b.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {b.paymentStatus === 'PAID' ? 'Đã Thanh Toán' : 'Thanh Toán Tại Sảnh'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>Sinh viên: <strong className="text-slate-800">{b.customerName}</strong> ({b.phone})</span>
                    {b.studentId && <span>MSSV: <strong>{b.studentId}</strong></span>}
                    <span>Giờ hẹn: <strong className="text-blue-700">{b.bookingDate} ({b.slotTime})</strong></span>
                  </div>

                  {b.issueNote && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200/60 inline-block">
                      <strong>Triệu chứng:</strong> {b.issueNote}
                    </p>
                  )}
                </div>

                {/* Right: Quick Action Buttons for Staff */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  
                  {b.status === 'PENDING' && (
                    <button
                      onClick={() => onUpdateStatus(b.id, 'CHECKED_IN')}
                      className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs"
                    >
                      <span>1. Nhận Máy Tại Sảnh</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {b.status === 'CHECKED_IN' && (
                    <button
                      onClick={() => onUpdateStatus(b.id, 'CLEANING')}
                      className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>2. Bắt Đầu Vệ Sinh 30p</span>
                    </button>
                  )}

                  {b.status === 'CLEANING' && (
                    <button
                      onClick={() => onUpdateStatus(b.id, 'READY')}
                      className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>3. Báo Xong - Chờ Khách Lấy</span>
                    </button>
                  )}

                  {b.status === 'READY' && (
                    <button
                      onClick={() => onUpdateStatus(b.id, 'COMPLETED')}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>4. Test Âm Thanh & Bàn Giao</span>
                    </button>
                  )}

                  {b.status === 'COMPLETED' && (
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Đã giao thành công</span>
                    </span>
                  )}

                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
