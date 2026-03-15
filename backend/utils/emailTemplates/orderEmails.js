const BRAND = 'Crazy Wheelz Diecast';
const BRAND_COLOR = '#1890ff';
const ACCENT = '#667eea';

const paymentLabels = {
  upi: 'UPI',
  card: 'Credit / Debit Card',
  netbanking: 'Net Banking',
  cod: 'Cash on Delivery',
};

// ── Shared HTML skeleton ─────────────────────────────────────

const wrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${BRAND}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;">
<tr><td align="center" style="padding:24px 12px;">

<!-- Main card -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

  <!-- Header banner -->
  <tr>
    <td style="background:linear-gradient(135deg,${BRAND_COLOR},${ACCENT});padding:28px 24px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:0.5px;">🏎️ ${BRAND}</h1>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="padding:28px 24px 16px;">
      ${content}
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="padding:16px 24px 24px;text-align:center;border-top:1px solid #f0f0f0;">
      <p style="margin:0;font-size:12px;color:#aaa;">© ${new Date().getFullYear()} ${BRAND}. All rights reserved.</p>
      <p style="margin:4px 0 0;font-size:12px;color:#bbb;">This is an automated message, please do not reply.</p>
    </td>
  </tr>

</table>
</td></tr></table>
</body>
</html>`;

// ── Item rows ────────────────────────────────────────────────

const itemRows = (items) =>
  items
    .map(
      (item) => `
  <tr>
    <td style="padding:8px 0;border-bottom:1px solid #f5f5f5;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="52" style="vertical-align:top;">
          <img src="${item.image}" alt="${item.name}" width="48" height="48"
               style="border-radius:8px;object-fit:cover;display:block;" />
        </td>
        <td style="padding-left:10px;vertical-align:top;">
          <p style="margin:0;font-size:13px;font-weight:600;color:#333;">${item.name}</p>
          <p style="margin:2px 0 0;font-size:12px;color:#888;">Qty: ${item.quantity} × ₹${item.price.toLocaleString('en-IN')}</p>
        </td>
        <td width="80" style="text-align:right;vertical-align:top;font-size:13px;font-weight:600;color:#333;">
          ₹${(item.price * item.quantity).toLocaleString('en-IN')}
        </td>
      </tr></table>
    </td>
  </tr>`
    )
    .join('');

// ── Summary rows ─────────────────────────────────────────────

const summaryRow = (label, value, bold = false) => `
  <tr>
    <td style="padding:4px 0;font-size:13px;color:${bold ? '#333' : '#666'};">
      ${label}
    </td>
    <td style="padding:4px 0;text-align:right;font-size:${bold ? '15px' : '13px'};font-weight:${bold ? '700' : '400'};color:${bold ? BRAND_COLOR : '#333'};">
      ${value}
    </td>
  </tr>`;

// ── Address block ────────────────────────────────────────────

const addressBlock = (addr) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;padding:12px;margin-bottom:16px;">
    <tr><td>
      <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#333;">📍 ${addr.fullName}</p>
      <p style="margin:0;font-size:12px;color:#666;line-height:1.5;">
        ${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}<br/>
        ${addr.city}, ${addr.state} – ${addr.pincode}<br/>
        📞 ${addr.phone}
      </p>
    </td></tr>
  </table>`;

// ═══════════════════════════════════════════════════════════════
//  PUBLIC TEMPLATES
// ═══════════════════════════════════════════════════════════════

/**
 * Customer order confirmation email
 */
exports.customerOrderEmail = (order, userName) => {
  const orderId = order._id.toString().slice(-8).toUpperCase();
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const html = wrapper(`
    <!-- Greeting -->
    <h2 style="margin:0 0 6px;font-size:18px;color:#333;">Thank you for your order! 🎉</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#666;">
      Hi <strong>${userName}</strong>, your order <strong>#${orderId}</strong> has been placed successfully on <strong>${date}</strong>.
    </p>

    <!-- Items -->
    <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#333;">Order Items</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${itemRows(order.items)}
    </table>

    <!-- Summary -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;border-top:2px solid #f0f0f0;padding-top:10px;">
      ${summaryRow('Subtotal', '₹' + order.itemsTotal.toLocaleString('en-IN'))}
      ${summaryRow('Delivery', order.deliveryCharge === 0 ? '<span style="color:#52c41a;font-weight:600;">FREE</span>' : '₹' + order.deliveryCharge)}
      ${summaryRow('Total', '₹' + order.grandTotal.toLocaleString('en-IN'), true)}
    </table>

    <!-- Payment -->
    <p style="margin:16px 0 8px;font-size:13px;color:#888;">
      💳 Payment: <strong style="color:#333;">${paymentLabels[order.paymentMethod] || order.paymentMethod}</strong>
    </p>

    <!-- Address -->
    <p style="margin:16px 0 8px;font-size:14px;font-weight:600;color:#333;">Shipping Address</p>
    ${addressBlock(order.shippingAddress)}

    <!-- CTA -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding:8px 0 0;">
        <p style="margin:0;font-size:13px;color:#888;">We'll notify you when your order ships. Happy collecting! 🏁</p>
      </td></tr>
    </table>
  `);

  return {
    subject: `✅ Order Confirmed – #${orderId} | ${BRAND}`,
    html,
  };
};

/**
 * Admin new-order notification email
 */
exports.adminOrderEmail = (order, userEmail, userName) => {
  const orderId = order._id.toString().slice(-8).toUpperCase();
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const html = wrapper(`
    <!-- Alert -->
    <h2 style="margin:0 0 6px;font-size:18px;color:#333;">🛒 New Order Received!</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#666;">
      Order <strong>#${orderId}</strong> placed by <strong>${userName}</strong> (<a href="mailto:${userEmail}" style="color:${BRAND_COLOR};">${userEmail}</a>) on ${date}.
    </p>

    <!-- Items -->
    <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#333;">Items Ordered (${order.items.length})</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${itemRows(order.items)}
    </table>

    <!-- Summary -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;border-top:2px solid #f0f0f0;padding-top:10px;">
      ${summaryRow('Items Total', '₹' + order.itemsTotal.toLocaleString('en-IN'))}
      ${summaryRow('Delivery', order.deliveryCharge === 0 ? 'FREE' : '₹' + order.deliveryCharge)}
      ${summaryRow('Grand Total', '₹' + order.grandTotal.toLocaleString('en-IN'), true)}
    </table>

    <!-- Payment & Address -->
    <p style="margin:16px 0 4px;font-size:13px;color:#888;">
      💳 Payment: <strong style="color:#333;">${paymentLabels[order.paymentMethod] || order.paymentMethod}</strong>
    </p>
    <p style="margin:16px 0 8px;font-size:14px;font-weight:600;color:#333;">Ship To</p>
    ${addressBlock(order.shippingAddress)}
  `);

  return {
    subject: `🛒 New Order #${orderId} – ₹${order.grandTotal.toLocaleString('en-IN')} | ${BRAND}`,
    html,
  };
};

/**
 * Customer order cancellation email
 */
exports.orderCancelledEmail = (order, userName) => {
  const orderId = order._id.toString().slice(-8).toUpperCase();
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const html = wrapper(`
    <!-- Greeting -->
    <h2 style="margin:0 0 6px;font-size:18px;color:#d32f2f;">Order Cancelled ❌</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#666;">
      Hi <strong>${userName}</strong>, your order <strong>#${orderId}</strong> placed on <strong>${date}</strong> has been cancelled.
    </p>

    <!-- Items -->
    <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#333;">Items in this order</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${itemRows(order.items)}
    </table>

    <!-- Summary -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;border-top:2px solid #f0f0f0;padding-top:10px;">
      ${summaryRow('Subtotal', '₹' + order.itemsTotal.toLocaleString('en-IN'))}
      ${summaryRow('Delivery', order.deliveryCharge === 0 ? '<span style="color:#52c41a;font-weight:600;">FREE</span>' : '₹' + order.deliveryCharge)}
      ${summaryRow('Total', '₹' + order.grandTotal.toLocaleString('en-IN'), true)}
    </table>

    <!-- Payment -->
    <p style="margin:16px 0 8px;font-size:13px;color:#888;">
      💳 Payment: <strong style="color:#333;">${paymentLabels[order.paymentMethod] || order.paymentMethod}</strong>
    </p>

    <!-- Refund note -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;background:#fff3e0;border-radius:8px;padding:14px;">
      <tr><td>
        <p style="margin:0;font-size:13px;color:#e65100;line-height:1.5;">
          If you made an online payment, your refund will be processed within 5-7 business days.
          For any queries, please contact us.
        </p>
      </td></tr>
    </table>

    <!-- CTA -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding:16px 0 0;">
        <p style="margin:0;font-size:13px;color:#888;">We're sorry for the inconvenience. We hope to serve you again! 🏁</p>
      </td></tr>
    </table>
  `);

  return {
    subject: `❌ Order Cancelled – #${orderId} | ${BRAND}`,
    html,
  };
};
