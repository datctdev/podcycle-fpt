/**
 * SEPAY PAYMENT GATEWAY SERVICE (SEPAY.VN)
 * Cổng thanh toán chuyển khoản và thẻ thông qua bên thứ ba SePay (Production 100%)
 * Không hardcode STK cá nhân, không sandbox giả lập
 */

import CryptoJS from 'crypto-js';

// ==============================================================
// 1. CẤU HÌNH SEPAY PAYMENT GATEWAY (PRODUCTION)
// ==============================================================
export type SePayPgEnv = 'production';

export interface SePayPgConfig {
  env: 'production';
  merchant_id: string;
  secret_key: string;
}

export interface OneTimePaymentParams {
  payment_method?: 'BANK_TRANSFER' | 'NAPAS_BANK_TRANSFER';
  order_invoice_number: string;
  order_amount: number;
  currency?: string;
  order_description?: string;
  customer_id?: string;
  success_url?: string;
  error_url?: string;
  cancel_url?: string;
  custom_data?: string;
}

export interface SePayCheckoutFormFields {
  [key: string]: string | number;
  merchant: string;
  operation: string;
  payment_method: string;
  order_invoice_number: string;
  order_amount: number;
  currency: string;
  order_description: string;
  signature: string;
}

export const DEFAULT_SEPAY_PG_CONFIG: SePayPgConfig = {
  env: 'production',
  merchant_id: '',
  secret_key: ''
};

/**
 * Lấy cấu hình SePay PG (Production) từ Environment Variables hoặc LocalStorage
 */
export const getSePayPgConfig = (): SePayPgConfig => {
  try {
    const saved = localStorage.getItem('ttn_sepay_pg_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        env: (parsed.env as SePayPgEnv) || (import.meta.env.VITE_SEPAY_ENV as SePayPgEnv) || 'production',
        merchant_id: parsed.merchant_id || import.meta.env.VITE_SEPAY_MERCHANT_ID || '',
        secret_key: parsed.secret_key || import.meta.env.VITE_SEPAY_SECRET_KEY || ''
      };
    }
  } catch {
    // ignore
  }

  return {
    env: (import.meta.env.VITE_SEPAY_ENV as SePayPgEnv) || 'production',
    merchant_id: import.meta.env.VITE_SEPAY_MERCHANT_ID || '',
    secret_key: import.meta.env.VITE_SEPAY_SECRET_KEY || ''
  };
};

/**
 * Lưu cấu hình SePay PG vào LocalStorage
 */
export const saveSePayPgConfig = (config: Partial<SePayPgConfig>) => {
  const current = getSePayPgConfig();
  const updated = { ...current, ...config };
  localStorage.setItem('ttn_sepay_pg_config', JSON.stringify(updated));
  return updated;
};

/**
 * Lớp SePay Payment Gateway Client chuẩn Production (sepay-pg-node tương thích)
 */
export class SePayPgClient {
  private config: SePayPgConfig;

  constructor(config?: Partial<SePayPgConfig>) {
    const defaultConfig = getSePayPgConfig();
    this.config = {
      env: config?.env || defaultConfig.env,
      merchant_id: (config?.merchant_id ?? defaultConfig.merchant_id).trim(),
      secret_key: (config?.secret_key ?? defaultConfig.secret_key).trim()
    };
  }

  public get checkout() {
    return {
      initCheckoutUrl: (): string => {
        return 'https://pay.sepay.vn/v1/checkout/init';
      },

      initOneTimePaymentFields: (params: OneTimePaymentParams): SePayCheckoutFormFields => {
        const fields: Record<string, any> = {
          operation: 'PURCHASE',
          payment_method: params.payment_method || 'BANK_TRANSFER',
          order_invoice_number: params.order_invoice_number,
          order_amount: Math.round(params.order_amount),
          currency: params.currency || 'VND',
          order_description: params.order_description || `Thanh toan don ${params.order_invoice_number}`,
        };

        if (params.customer_id) fields.customer_id = params.customer_id;
        if (params.success_url) fields.success_url = params.success_url;
        if (params.error_url) fields.error_url = params.error_url;
        if (params.cancel_url) fields.cancel_url = params.cancel_url;
        if (params.custom_data) fields.custom_data = params.custom_data;

        fields.merchant = this.config.merchant_id;

        const signature = this.signFields(fields);
        return {
          ...fields,
          signature
        } as SePayCheckoutFormFields;
      }
    };
  }

  /**
   * Ký chữ ký HMAC-SHA256 chuẩn đặc tả của SePay Payment Gateway (sepay-pg-node tương thích 100%)
   */
  private signFields(fields: Record<string, any>): string {
    const signedAllowed = [
      'merchant',
      'env',
      'operation',
      'payment_method',
      'order_amount',
      'currency',
      'order_invoice_number',
      'order_description',
      'customer_id',
      'agreement_id',
      'agreement_name',
      'agreement_type',
      'agreement_payment_frequency',
      'agreement_amount_per_payment',
      'success_url',
      'error_url',
      'cancel_url',
      'order_id'
    ];

    const signed: string[] = [];
    const signedFields = Object.keys(fields).filter(field => signedAllowed.includes(field));
    for (const field of signedFields) {
      if (fields[field] === undefined) continue;
      signed.push(`${field}=${fields[field] ?? ''}`);
    }

    const payload = signed.join(',');
    const hash = CryptoJS.HmacSHA256(payload, this.config.secret_key);
    return CryptoJS.enc.Base64.stringify(hash);
  }
}

/**
 * Chuyển hướng toàn màn hình (Full-page Redirect) sang Cổng Thanh Toán SePay PG chính thức
 * Không dùng iframe, hỗ trợ 100% deep-link app ngân hàng và redirect tự động về vé hẹn sau khi thanh toán
 */
export const redirectToSePayCheckout = (params: {
  bookingCode: string;
  amount: number;
  description?: string;
  customerId?: string;
}) => {
  const pgConfig = getSePayPgConfig();
  if (!pgConfig.merchant_id || !pgConfig.secret_key) {
    throw new Error('Chưa cấu hình SePay Merchant ID hoặc Secret Key.');
  }

  const pgClient = new SePayPgClient(pgConfig);
  const checkoutUrl = pgClient.checkout.initCheckoutUrl();
  const origin = window.location.origin;

  const successUrl = `${origin}/detail/${params.bookingCode}?payment=success`;
  const cancelUrl = `${origin}/detail/${params.bookingCode}?payment=cancel`;
  const errorUrl = `${origin}/detail/${params.bookingCode}?payment=error`;

  const fields = pgClient.checkout.initOneTimePaymentFields({
    payment_method: 'BANK_TRANSFER',
    order_invoice_number: params.bookingCode,
    order_amount: params.amount,
    currency: 'VND',
    order_description: params.description || `Thanh toan don hang ${params.bookingCode}`,
    customer_id: params.customerId,
    success_url: successUrl,
    error_url: errorUrl,
    cancel_url: cancelUrl,
  });

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = checkoutUrl;
  form.style.display = 'none';

  Object.entries(fields).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = String(val);
      form.appendChild(input);
    }
  });

  document.body.appendChild(form);
  form.submit();
};


/**
 * Kiểm tra trạng thái thanh toán đơn hàng trực tiếp qua SePay Payment Gateway Order API
 * Sử dụng Merchant ID & Secret Key (Basic Auth) - Chuẩn SePay PG
 */
export const checkSePayPgOrderStatus = async (
  orderInvoiceNumber: string
): Promise<{ isPaid: boolean; message?: string; data?: any }> => {
  const config = getSePayPgConfig();
  if (!config.merchant_id || !config.secret_key) {
    return { isPaid: false, message: 'Chưa cấu hình SePay Merchant ID và Secret Key.' };
  }

  try {
    const authString = `${config.merchant_id}:${config.secret_key}`;
    const basicAuth = btoa(authString);

    const res = await fetch(`https://pgapi.sepay.vn/v1/order/detail/${encodeURIComponent(orderInvoiceNumber)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      return { isPaid: false, message: `SePay PG API HTTP ${res.status}` };
    }

    const result = await res.json();
    const orderData = result.data;
    if (!orderData) {
      return { isPaid: false, message: 'Không tìm thấy dữ liệu đơn hàng trên SePay.' };
    }

    const isCompleted =
      orderData.order_status === 'COMPLETED' ||
      orderData.order_status === 'PAID' ||
      (Array.isArray(orderData.transactions) &&
        orderData.transactions.length > 0 &&
        orderData.transactions.some(
          (tx: any) => tx.status === 'SUCCESS' || tx.status === 'COMPLETED'
        ));

    if (isCompleted) {
      return {
        isPaid: true,
        message: `Xác nhận thanh toán thành công qua Cổng SePay (Mã GD: ${orderData.order_id || orderInvoiceNumber})!`,
        data: orderData
      };
    }

    return {
      isPaid: false,
      message: 'Đơn hàng đang chờ thanh toán trên cổng SePay...',
      data: orderData
    };
  } catch (err: any) {
    return {
      isPaid: false,
      message: err.message || 'Lỗi khi gọi SePay PG API'
    };
  }
};

// ==============================================================
// 2. SEPAY TRANSACTION TRA CỨU & AUTO-POLLING API
// ==============================================================
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

export const getSePayApiToken = (): string => {
  return (
    localStorage.getItem('ttn_sepay_api_key') ||
    import.meta.env.VITE_SEPAY_API_KEY ||
    ''
  ).trim();
};

export const saveSePayApiToken = (token: string) => {
  localStorage.setItem('ttn_sepay_api_key', token.trim());
};

/**
 * Gọi SePay API v2 để tra cứu sao kê biến động số dư
 */
async function fetchSePayTransactions(token: string, limit = 20): Promise<SePayApiResponse> {
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
          messages: ['API Key SePay không hợp lệ.'],
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
    }
  }

  throw lastError || new Error('Không thể kết nối đến SePay API v2.');
}

/**
 * Kiểm tra kết nối SePay API Token
 */
export const testSePayConnection = async (
  apiKey?: string
): Promise<{ success: boolean; message: string }> => {
  const token = apiKey || getSePayApiToken();
  if (!token) {
    return {
      success: false,
      message: 'Chưa nhập SePay API Key!'
    };
  }

  try {
    const res = await fetchSePayTransactions(token, 5);
    if (res.status === 401) {
      return {
        success: false,
        message: 'Mã SePay API Key không chính xác. Vui lòng lấy tại https://my.sepay.vn'
      };
    }
    if (res.status === 200) {
      return {
        success: true,
        message: 'Kết nối SePay API thành công! Hệ thống sẵn sàng đối soát tự động.'
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
 * Kiểm tra thanh toán tự động qua SePay API
 */
export const checkSePayPayment = async (
  bookingCode: string,
  expectedAmount: number
): Promise<{
  isPaid: boolean;
  transaction?: SePayTransaction;
  message?: string;
}> => {
  const token = getSePayApiToken();
  if (!token) {
    return {
      isPaid: false,
      message: 'Chưa cấu hình SePay API Key để tự động polling.'
    };
  }

  try {
    const res = await fetchSePayTransactions(token, 30);
    if (res.status !== 200 || !res.transactions || res.transactions.length === 0) {
      return { isPaid: false, message: 'Chưa có biến động số dư nào gần đây.' };
    }

    const rawCode = bookingCode.replace(/^TTN-?/i, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const codeFull = bookingCode.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');

    for (const tx of res.transactions) {
      const amountIn = parseFloat(tx.amount_in || '0');
      if (amountIn < Math.round(expectedAmount)) {
        continue;
      }

      const content = (tx.transaction_content || '').toLowerCase();
      const contentNormalized = content.replace(/[^a-zA-Z0-9]/g, '');

      const matchesCode =
        contentNormalized.includes(rawCode) ||
        contentNormalized.includes(codeFull) ||
        contentNormalized.includes(`ttn${rawCode}`) ||
        content.includes(`ttn ${rawCode}`) ||
        content.includes(bookingCode.toLowerCase());

      if (matchesCode) {
        return {
          isPaid: true,
          transaction: tx,
          message: `Giao dịch thành công! Nhận ${amountIn.toLocaleString('vi-VN')}đ qua ${tx.bank_brand_name || 'SePay'}`
        };
      }
    }

    return {
      isPaid: false,
      message: 'Đang tiếp tục chờ biến động số dư từ SePay...'
    };
  } catch (err: any) {
    return {
      isPaid: false,
      message: err.message || 'Lỗi khi kiểm tra giao dịch SePay'
    };
  }
};
