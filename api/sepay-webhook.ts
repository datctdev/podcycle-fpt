import { createClient } from '@supabase/supabase-js';

// Vercel Serverless Function Handler
// Nhận Webhook IPN từ cổng thanh toán SePay trên môi trường Production
export default async function handler(req: any, res: any) {
  // Cấu hình CORS để SePay và client có thể gọi mà không bị chặn
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Health check endpoint khi mở bằng trình duyệt
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'online',
      service: 'PODCYCLE SePay Webhook IPN Receiver (Production Vercel)',
      endpoint: '/api/sepay-webhook',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let payload = req.body;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {
        payload = {};
      }
    } else if (!payload) {
      payload = {};
    }

    console.log('[🔔 SEPAY PRODUCTION WEBHOOK RECEIVED]:', JSON.stringify(payload, null, 2));

    // 1. Trích xuất mã đơn hàng từ nội dung thanh toán hoặc trường invoice number
    let bookingCode = payload.order_invoice_number || payload.code || '';
    const content = payload.transaction_content || payload.content || payload.order_description || '';
    if (!bookingCode && content) {
      const match = content.match(/(PC|TTN)[-_ ]?\d+/i);
      if (match) {
        bookingCode = match[0].replace(/[-_ ]/, '-').toUpperCase();
      }
    }

    console.log(`[SePay Webhook] Detected Booking Code: "${bookingCode}"`);

    if (!bookingCode) {
      console.warn('[SePay Webhook] Không tìm thấy mã đơn hàng hợp lệ trong payload:', payload);
      return res.status(200).json({
        success: true,
        message: 'Webhook received but no valid booking code detected',
        ignored: true
      });
    }

    // 2. Khởi tạo Supabase client kết nối Cloud PostgreSQL
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://blgmdjvzkadleqvjtcxy.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_a_FEnye_BC38vHJLxphmfw_1Knp1HNk';
    const sb = createClient(supabaseUrl, supabaseKey);

    // 3. Cập nhật trạng thái đơn hàng sang CONFIRMED và PAID
    const { data: updatedBookings, error: updateError } = await sb
      .from('bookings')
      .update({
        status: 'CONFIRMED',
        payment_status: 'PAID'
      })
      .ilike('booking_code', bookingCode)
      .select();

    if (updateError) {
      console.error('[SePay Webhook] Supabase update error:', updateError);
      return res.status(500).json({ success: false, error: updateError.message });
    }

    if (!updatedBookings || updatedBookings.length === 0) {
      console.warn(`[SePay Webhook] Không tìm thấy đơn hàng "${bookingCode}" trong database để cập nhật.`);
      return res.status(200).json({
        success: true,
        message: `Booking code "${bookingCode}" not found in database.`,
        bookingCode
      });
    }

    const b = updatedBookings[0];
    console.log(`[SePay Webhook] ✅ Đã kích hoạt thành công đơn hàng ${b.booking_code}!`);

    // 4. Ghi nhận giao dịch vào bảng transactions
    const amount = payload.transferAmount || payload.order_amount || payload.amount_in || b.amount;
    const txId = 'tx_' + (payload.id || Date.now());
    await sb.from('transactions').insert([{
      id: txId,
      booking_id: b.id,
      booking_code: b.booking_code,
      amount: Number(amount),
      payment_method: 'SEPAY_PG',
      reference_number: String(payload.id || payload.referenceCode || payload.reference_number || 'IPN_VERCEL'),
      status: 'SUCCESS'
    }]);

    return res.status(200).json({
      success: true,
      message: `Đơn hàng ${b.booking_code} đã được kích hoạt thành công!`,
      bookingCode: b.booking_code
    });
  } catch (err: any) {
    console.error('[SePay Webhook Error]:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal Server Error'
    });
  }
}
