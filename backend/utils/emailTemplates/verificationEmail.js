const BRAND = 'Crazy Wheelz Diecast';
const BRAND_COLOR = '#1890ff';
const ACCENT = '#667eea';

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

/**
 * Email sent to user after registration to verify their email address.
 */
const verificationEmail = (name, verifyUrl) => {
  const content = `
    <h2 style="margin:0 0 8px;font-size:20px;color:#333;">Verify Your Email Address</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#666;">
      Hi <strong>${name}</strong>, thanks for signing up! Please verify your email address to activate your account.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:12px 0 24px;">
          <a href="${verifyUrl}" 
             style="display:inline-block;background:linear-gradient(135deg,${BRAND_COLOR},${ACCENT});color:#fff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;">
            Verify Email Address
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px;font-size:13px;color:#888;">
      Or copy and paste this link into your browser:
    </p>
    <p style="margin:0 0 20px;font-size:12px;color:${BRAND_COLOR};word-break:break-all;">
      ${verifyUrl}
    </p>

    <div style="background:#fff8e1;border-left:4px solid #ffb300;padding:12px 16px;border-radius:4px;margin:0 0 12px;">
      <p style="margin:0;font-size:13px;color:#666;">
        ⏰ This link expires in <strong>24 hours</strong>. If it expires, you can request a new one from the login page.
      </p>
    </div>

    <p style="margin:12px 0 0;font-size:13px;color:#999;">
      If you didn't create an account, you can safely ignore this email.
    </p>
  `;

  return wrapper(content);
};

module.exports = { verificationEmail };
