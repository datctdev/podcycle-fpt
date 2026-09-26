/**
 * SEPAY AUTOMATED PAYMENT INTEGRATION SERVICE (SEPAY.VN)
 * Cổng thanh toán tự động kiểm tra biến động số dư ngân hàng qua SePay API v2
 * Chuẩn NAPAS 24/7 - VietQR Realtime
 */

export interface SePayConfig {
  apiKey: string;
  accountNo: string;
  bank: string;
  accountName: string;
}

export interface SePayTransaction {
  id: number | string;
  bank_brand_name?: string;
  account_number?: string;
  transaction_date?: string;
  amount_out?: string;
  amount_in: string;
  accumulated?: string;
  transaction_content: string;
  reference_number?: string;
  code?: string | null;
  sub_account?: string | null;
}

export interface SePayApiResponse {
  status: number;
  messages: string[];
  transactions: SePayTransaction[];
  error?: string;
}

// Cấu hình mặc định cho SePay
export const DEFAULT_SEPAY_CONFIG: SePayConfig = {
  apiKey: '',
  accountNo: '07478087601',
  bank: 'TPBank',
  accountName: 'CHAU THANH DAT'
};

/**
 * Lấy cấu hình SePay hiện tại từ LocalStorage hoặc Environment Variables
 */
export const getSePayConfig = (): SePayConfig => {
  try {
    const saved = localStorage.getItem('ttn_sepay_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey || parsed.accountNo) {
        return {
          apiKey: parsed.apiKey || import.meta.env.VITE_SEPAY_API_KEY || '',
          accountNo: parsed.accountNo || import.meta.env.VITE_SEPAY_ACCOUNT_NO || import.meta.env.VITE_VIETQR_ACCOUNT_NO || DEFAULT_SEPAY_CONFIG.accountNo,
          bank: parsed.bank || import.meta.env.VITE_SEPAY_BANK || import.meta.env.VITE_VIETQR_BANK_ID || DEFAULT_SEPAY_CONFIG.bank,
          accountName: parsed.accountName || import.meta.env.VITE_SEPAY_ACCOUNT_NAME || import.meta.env.VITE_VIETQR_ACCOUNT_NAME || DEFAULT_SEPAY_CONFIG.accountName
        };
      }
    }
  } catch {
    // ignore
  }

  return {
    apiKey: import.meta.env.VITE_SEPAY_API_KEY || '',
    accountNo: import.meta.env.VITE_SEPAY_ACCOUNT_NO || import.meta.env.VITE_VIETQR_ACCOUNT_NO || DEFAULT_SEPAY_CONFIG.accountNo,
    bank: import.meta.env.VITE_SEPAY_BANK || import.meta.env.VITE_VIETQR_BANK_ID || DEFAULT_SEPAY_CONFIG.bank,
    accountName: import.meta.env.VITE_SEPAY_ACCOUNT_NAME || import.meta.env.VITE_VIETQR_ACCOUNT_NAME || DEFAULT_SEPAY_CONFIG.accountName
  };
};

/**
 * Lưu cấu hình SePay vào LocalStorage
 */
export const saveSePayConfig = (config: Partial<SePayConfig>) => {
  const current = getSePayConfig();
  const updated = { ...current, ...config };
  localStorage.setItem('ttn_sepay_config', JSON.stringify(updated));
  return updated;
};

/**
 * Sinh URL mã QR động chuẩn SePay
 * Tương thích 100% tất cả App Ngân Hàng Việt Nam (Napas 24/7)
 */
export const generateSePayQRUrl = (
  amount: number,
  bookingCode: string,
  customConfig?: SePayConfig
): string => {
  const cfg = customConfig || getSePayConfig();
  const cleanBank = encodeURIComponent(cfg.bank.trim());
  const cleanAcc = encodeURIComponent(cfg.accountNo.trim());
  const cleanAmount = Math.round(amount);
  
  // Chuẩn hóa cú pháp nội dung chuyển khoản: TTN <bookingCode>
  // Loại bỏ khoảng trắng thừa để ngân hàng không cắt bớt chuỗi
  const rawCode = bookingCode.replace(/^TTN-?/i, '').replace(/[^a-zA-Z0-9]/g, '');
  const transferContent = `TTN ${rawCode}`;
  const encodedContent = encodeURIComponent(transferContent);

  // Link QR SePay chính thức
  return `https://qr.sepay.vn/img?acc=${cleanAcc}&bank=${cleanBank}&amount=${cleanAmount}&des=${encodedContent}&template=compact`;
};

/**
 * Sinh mã thanh toán chuẩn để khách hiển thị / copy
 */
export const getTransferSyntax = (bookingCode: string): string => {
  const rawCode = bookingCode.replace(/^TTN-?/i, '').replace(/[^a-zA-Z0-9]/g, '');
  return `TTN ${rawCode}`;
};

/**
 * Gọi API SePay v2 qua Proxy hoặc Direct URL
 */
async function fetchSePayTransactions(token: string, limit = 20): Promise<SePayApiResponse> {
  // Thử qua Vite proxy trước để tránh lỗi CORS trên localhost
  const endpoints = [
    `/api/sepay/v2/transactions?limit=${limit}`,
    `https://userapi.sepay.vn/v2/transactions?limit=${limit}`
  ];

  let lastError: any = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        return {
          status: 401,
          messages: ['API Key SePay không hợp lệ hoặc đã hết hạn.'],
          transactions: [],
          error: 'Unauthorized: Invalid SePay API Key'
        };
      }

      if (!response.ok) {
        const text = await response.text();
        lastError = new Error(`SePay API HTTP ${response.status}: ${text}`);
        continue;
      }

      const data = await response.json();
      return {
        status: data.status || 200,
        messages: data.messages || ['success'],
        transactions: Array.isArray(data.transactions) ? data.transactions : []
      };
    } catch (err: any) {
      lastError = err;
      // Thử tiếp endpoint tiếp theo
    }
  }

  throw lastError || new Error('Không thể kết nối đến SePay API v2.');
}

/**
 * Kiểm tra kết nối SePay API Token có hợp lệ không
 */
export const testSePayConnection = async (
  apiKey?: string
): Promise<{ success: boolean; message: string; accountInfo?: string }> => {
  const token = apiKey || getSePayConfig().apiKey;
  if (!token) {
    return {
      success: false,
      message: 'Chưa nhập SePay API Key (Token)!'
    };
  }

  try {
    const res = await fetchSePayTransactions(token, 5);
    if (res.status === 401) {
      return {
        success: false,
        message: 'Mã SePay API Key không chính xác. Vui lòng lấy API Token tại https://my.sepay.vn'
      };
    }
    if (res.status === 200) {
      const sample = res.transactions[0];
      return {
        success: true,
        message: 'Kết nối SePay API v2 thành công!',
        accountInfo: sample
          ? `Ngân hàng: ${sample.bank_brand_name || 'Napas'} - STK: ${sample.account_number || 'Khớp'}`
          : 'Hệ thống đã kết nối SePay và sẵn sàng lắng nghe thanh toán.'
      };
    }
    return {
      success: false,
      message: res.messages?.[0] || 'Lỗi kiểm tra SePay API'
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Lỗi mạng khi kết nối SePay'
    };
  }
};

/**
 * So khớp giao dịch SePay (Transaction Matching Logic)
 * Khách hàng chuyển khoản nội dung: "TTN 8821" hoặc "TTN8821" hoặc "TTN-8821"
 * Ngân hàng sẽ gửi nội dung chứa chuỗi này vào sao kê biến động số dư.
 */
export const checkSePayPayment = async (
  bookingCode: string,
  expectedAmount: number
): Promise<{
  isPaid: boolean;
  transaction?: SePayTransaction;
  message?: string;
}> => {
  const config = getSePayConfig();
  if (!config.apiKey) {
    return {
      isPaid: false,
      message: 'Chưa cấu hình SePay API Key trong Settings hoặc file .env'
    };
  }

  try {
    const res = await fetchSePayTransactions(config.apiKey, 30);
    if (res.status !== 200 || !res.transactions || res.transactions.length === 0) {
      return { isPaid: false, message: 'Chưa có biến động số dư nào gần đây.' };
    }

    // Chuẩn hóa mã đơn để so khớp linh hoạt
    const rawCode = bookingCode.replace(/^TTN-?/i, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const codeFull = bookingCode.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');

    for (const tx of res.transactions) {
      // 1. Kiểm tra số tiền nhận (amount_in)
      const amountIn = parseFloat(tx.amount_in || '0');
      if (amountIn < Math.round(expectedAmount)) {
        continue;
      }

      // 2. Chuẩn hóa nội dung sao kê của ngân hàng
      // Ví dụ nội dung thực tế: "MBVCB.789123.TTN 8821 CHAU THANH DAT chuyen khoan"
      const content = (tx.transaction_content || '').toLowerCase();
      const contentNormalized = content.replace(/[^a-zA-Z0-9]/g, '');

      // So khớp nếu nội dung chứa mã đơn hoặc cú pháp "ttn" + mã số
      const matchesCode =
        contentNormalized.includes(rawCode) ||
        contentNormalized.includes(codeFull) ||
        contentNormalized.includes(`ttn${rawCode}`) ||
        content.includes(`ttn ${rawCode}`) ||
        content.includes(bookingCode.toLowerCase());

      if (matchesCode) {
        console.log('[SePay] Match found for booking:', bookingCode, tx);
        return {
          isPaid: true,
          transaction: tx,
          message: `Giao dịch thành công! Nhận ${amountIn.toLocaleString('vi-VN')}đ qua ${tx.bank_brand_name || 'Napas'}`
        };
      }
    }

    return {
      isPaid: false,
      message: 'Đang tiếp tục chờ biến động số dư từ ngân hàng...'
    };
  } catch (err: any) {
    console.error('[SePay Error]', err);
    return {
      isPaid: false,
      message: err.message || 'Lỗi khi kiểm tra giao dịch SePay'
    };
  }
};
