import React, { useState } from 'react';
import { 
  BankConfig, 
  getBankConfig, 
  saveBankConfig, 
  POPULAR_BANKS, 
  getSupabaseConfig, 
  SUPABASE_SQL_SCHEMA 
} from '../services/db';
import { 
  getSePayConfig, 
  saveSePayConfig, 
  testSePayConnection, 
  SePayConfig,
  getSePayPgConfig,
  saveSePayPgConfig,
  SePayPgConfig 
} from '../services/sepay';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [bankConfig, setBankConfig] = useState<BankConfig>(getBankConfig());
  const [supabaseUrl, setSupabaseUrl] = useState(getSupabaseConfig().url);
  const [supabaseKey, setSupabaseKey] = useState(getSupabaseConfig().key);
  const [sepayPgConfig, setSepayPgConfigState] = useState<SePayPgConfig>(getSePayPgConfig());
  const [sepayConfig, setSepayConfigState] = useState<SePayConfig>(getSePayConfig());
  const [testingSepay, setTestingSepay] = useState(false);
  const [sepayTestResult, setSepayTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleTestSepay = async () => {
    setTestingSepay(true);
    setSepayTestResult(null);
    try {
      const res = await testSePayConnection(sepayConfig.apiKey);
      setSepayTestResult(res);
    } catch (err: any) {
      setSepayTestResult({ success: false, message: err.message || 'Lỗi kết nối' });
    } finally {
      setTestingSepay(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveBankConfig(bankConfig);
    saveSePayConfig(sepayConfig);
    saveSePayPgConfig(sepayPgConfig);
    if (supabaseUrl) localStorage.setItem('ttn_supabase_url', supabaseUrl.trim());
    if (supabaseKey) localStorage.setItem('ttn_supabase_key', supabaseKey.trim());
    setSavedSuccess(true);
    onSaved();
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const copySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white text-[#0b1c30] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 border border-slate-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#f26f21] text-[24px]">settings</span>
            <h3 className="font-heading font-extrabold text-base text-[#0b1c30]">
              Cấu Hình Data Thật (VietQR & Database)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
            <span>Đã lưu thành công cấu hình data thật!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          
          {/* SECTION 1: REAL VIETQR BANK CONFIG */}
          <div className="space-y-2.5 bg-orange-50/60 p-4 rounded-2xl border border-orange-200">
            <span className="font-heading font-bold text-xs text-[#f26f21] flex items-center gap-1.5 uppercase">
              <span className="material-symbols-outlined text-[18px]">account_balance</span>
              <span>1. Tài Khoản Ngân Hàng Thật (VietQR Chuẩn Napas)</span>
            </span>
            <p className="text-[11px] text-slate-500">
              Nhập STK của nhóm bạn để mã QR trên web nhận chuyển khoản tiền thật vào tài khoản.
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Ngân hàng:</label>
              <select
                value={bankConfig.bankId}
                onChange={(e) => {
                  const b = POPULAR_BANKS.find(x => x.id === e.target.value);
                  setBankConfig({
                    ...bankConfig,
                    bankId: e.target.value,
                    bankName: b?.name || e.target.value
                  });
                }}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-[#f26f21] focus:outline-none"
              >
                {POPULAR_BANKS.map((b) => (
                  <option key={b.id} value={b.id}>{b.name} ({b.id})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Số Tài Khoản (STK) *:</label>
                <input
                  type="text"
                  value={bankConfig.accountNo}
                  onChange={(e) => setBankConfig({ ...bankConfig, accountNo: e.target.value })}
                  placeholder="VD: 0388889999"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#f26f21] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tên Chủ Tài Khoản (Không dấu) *:</label>
                <input
                  type="text"
                  value={bankConfig.accountName}
                  onChange={(e) => setBankConfig({ ...bankConfig, accountName: e.target.value.toUpperCase() })}
                  placeholder="VD: CHAU THANH DAT"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-[#f26f21] focus:outline-none uppercase"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: SUPABASE CLOUD DATABASE CONFIG */}
          <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="font-heading font-bold text-xs text-[#0b1c30] flex items-center gap-1.5 uppercase">
              <span className="material-symbols-outlined text-[18px]">database</span>
              <span>2. Kết Nối Cloud Database PostgreSQL (Supabase)</span>
            </span>
            <p className="text-[11px] text-slate-500">
              Đồng bộ đơn đặt lịch real-time giữa điện thoại khách hàng và máy kỹ thuật viên. (Tạo miễn phí 100% tại <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">supabase.com</a>).
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Supabase Project URL:</label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono text-[11px] text-slate-900 focus:ring-2 focus:ring-[#f26f21] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Supabase Anon Key:</label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono text-[11px] text-slate-900 focus:ring-2 focus:ring-[#f26f21] focus:outline-none"
              />
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={copySql}
                className="w-full py-2 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">content_copy</span>
                <span>{copiedSql ? '✓ Đã copy mã SQL tạo bảng!' : 'Copy mã SQL tạo bảng cho Supabase'}</span>
              </button>
            </div>
          </div>

          {/* SECTION 3: SEPAY PAYMENT GATEWAY (MERCHANT ID & SECRET KEY) */}
          <div className="space-y-3 bg-blue-50/70 p-4 rounded-2xl border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-xs text-blue-900 flex items-center gap-1.5 uppercase">
                <span className="material-symbols-outlined text-[18px] text-blue-600">storefront</span>
                <span>3. Cổng Thanh Toán SePay PG (Merchant ID & Secret Key)</span>
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                SePay PG SDK
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Tích hợp Cổng thanh toán theo hướng dẫn chính thức SePay cung cấp (hỗ trợ chuyển hướng cổng thanh toán, thẻ và quét QR tự động). Lấy Merchant ID & Secret Key trong dashboard SePay tại <a href="https://my.sepay.vn" target="_blank" rel="noreferrer" className="text-blue-700 underline font-semibold">my.sepay.vn</a>.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Môi trường (Env):</label>
                <select
                  value={sepayPgConfig.env}
                  onChange={(e) => setSepayPgConfigState({ ...sepayPgConfig, env: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="sandbox">Sandbox (Thử nghiệm)</option>
                  <option value="production">Production (Thực tế)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Merchant ID *:</label>
                <input
                  type="text"
                  value={sepayPgConfig.merchant_id}
                  onChange={(e) => setSepayPgConfigState({ ...sepayPgConfig, merchant_id: e.target.value.trim() })}
                  placeholder="VD: MER-12345..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Merchant Secret Key *:</label>
              <input
                type="password"
                value={sepayPgConfig.secret_key}
                onChange={(e) => setSepayPgConfigState({ ...sepayPgConfig, secret_key: e.target.value.trim() })}
                placeholder="Dán Merchant Secret Key bảo mật..."
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono text-[11px] text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* SECTION 4: SEPAY AUTOMATED BANKING & API V2 (AUTO-POLLING) */}
          <div className="space-y-2.5 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200">
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-xs text-emerald-800 flex items-center gap-1.5 uppercase">
                <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
                <span>4. Tra Cứu Biến Động Số Dư & Auto-Polling</span>
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                Auto-Polling 24/7
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Nhận diện biến động tiền vào tài khoản ngân hàng không cần chụp màn hình chuyển khoản.
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                SePay API Token / Bearer Key (Tùy chọn tra cứu trực tiếp):
              </label>
              <input
                type="password"
                value={sepayConfig.apiKey}
                onChange={(e) => setSepayConfigState({ ...sepayConfig, apiKey: e.target.value })}
                placeholder="Dán mã API Token từ my.sepay.vn (nếu có)..."
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono text-[11px] text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-700 mb-1">STK nhận tiền:</label>
                <input
                  type="text"
                  value={sepayConfig.accountNo}
                  onChange={(e) => setSepayConfigState({ ...sepayConfig, accountNo: e.target.value })}
                  placeholder="07478087601"
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white font-mono text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-700 mb-1">Ngân hàng:</label>
                <input
                  type="text"
                  value={sepayConfig.bank}
                  onChange={(e) => setSepayConfigState({ ...sepayConfig, bank: e.target.value })}
                  placeholder="TPBank"
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900"
                />
              </div>
            </div>

            {sepayConfig.apiKey && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleTestSepay}
                  disabled={testingSepay}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  {testingSepay ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Đang kiểm tra SePay API...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[15px]">sensors</span>
                      <span>Kiểm Tra Kết Nối SePay API</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {sepayTestResult && (
              <div className={`p-2.5 rounded-xl text-[11px] font-medium flex items-start gap-1.5 ${sepayTestResult.success ? 'bg-emerald-100/80 text-emerald-900 border border-emerald-300' : 'bg-rose-100/80 text-rose-900 border border-rose-300'}`}>
                <span className="material-symbols-outlined text-[16px] shrink-0">
                  {sepayTestResult.success ? 'check_circle' : 'error'}
                </span>
                <span>{sepayTestResult.message}</span>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 fpt-gradient fpt-gradient-hover text-white font-bold text-xs py-3 rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Lưu Cấu Hình Data Thật</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              Hủy
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
