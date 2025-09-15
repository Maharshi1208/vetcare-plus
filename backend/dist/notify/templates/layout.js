"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderLayout = renderLayout;
function renderLayout(opts) {
    const { title, bodyHtml } = opts;
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="x-apple-disable-message-reformatting">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f6f6f6;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f6f6;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:20px 24px;background:#0b5ed7;color:#fff;font-weight:600;font-size:18px;">
              VetCare+
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px;color:#6b7280;font-size:12px;background:#fafafa;border-top:1px solid #eee;">
              This is an automated message from VetCare+. Please do not reply.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
