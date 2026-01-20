import { format } from "date-fns";

// DGC Brand Colors
const DGC_DEEP_GREEN = "#0F2A28";
const DGC_DEEP_GREEN_DARK = "#0A1D1B";
const DGC_GOLD = "#C6A45E";
const DGC_OFF_WHITE = "#F7F7F5";

interface BaseEmailData {
  companyName: string;
  companyLogo?: string;
  companyDocumentLogo?: string; // Preferred logo for emails/documents
  companyPhone?: string;
  companyWebsite?: string;
  companyAddress?: string;
  companyEmail?: string;
}

interface LeaveRequestEmailData extends BaseEmailData {
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason?: string;
  status?: "approved" | "rejected";
  rejectionReason?: string;
  reviewerName?: string;
}

interface PayslipEmailData extends BaseEmailData {
  employeeName: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  netPay: string;
  currency: string;
}

// Shared email header with logo and branding
function generateEmailHeader(data: BaseEmailData, gradientColors: { from: string; to: string } = { from: DGC_DEEP_GREEN, to: DGC_DEEP_GREEN_DARK }): string {
  // Prefer document logo for emails, fall back to regular logo
  const logoUrl = data.companyDocumentLogo || data.companyLogo;
  const logoSection = logoUrl 
    ? `<img src="${logoUrl}" alt="${data.companyName}" style="max-height:45px;max-width:150px;margin-right:15px;vertical-align:middle;background:transparent;" />`
    : `<div style="display:inline-block;width:45px;height:45px;background:rgba(255,255,255,0.2);border-radius:8px;margin-right:15px;vertical-align:middle;text-align:center;line-height:45px;font-size:20px;font-weight:bold;color:white;">${data.companyName.charAt(0)}</div>`;

  return `
    <tr>
      <td style="background:linear-gradient(135deg,${gradientColors.from} 0%,${gradientColors.to} 100%);padding:25px 30px;border-radius:12px 12px 0 0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="vertical-align:middle;">
              ${logoSection}
              <span style="color:#ffffff;font-size:22px;font-weight:600;vertical-align:middle;">${data.companyName}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

// Shared email footer with contact info and disclaimer
function generateEmailFooter(data: BaseEmailData): string {
  const phone = data.companyPhone || "+973 17000342";
  const website = data.companyWebsite || "www.dgcholding.com";
  const email = data.companyEmail || "info@dgcholding.com";
  const address = data.companyAddress || "Manama, Kingdom of Bahrain";

  return `
    <tr>
      <td style="background-color:#f9fafb;padding:25px 30px;border-top:1px solid #e5e7eb;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="text-align:center;">
              <p style="color:#18181b;margin:0 0 8px 0;font-size:14px;font-weight:600;">${data.companyName}</p>
              <p style="color:#71717a;margin:0 0 4px 0;font-size:12px;">${address}</p>
              <p style="color:#71717a;margin:0 0 15px 0;font-size:12px;">
                <a href="tel:${phone.replace(/\s/g, '')}" style="color:#71717a;text-decoration:none;">${phone}</a>
                &nbsp;|&nbsp;
                <a href="mailto:${email}" style="color:${DGC_GOLD};text-decoration:none;">${email}</a>
              </p>
              <p style="margin:0 0 15px 0;">
                <a href="https://${website}" style="color:${DGC_GOLD};text-decoration:none;font-size:12px;font-weight:500;">${website}</a>
              </p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:15px 0;" />
              <p style="color:#a1a1aa;margin:0;font-size:11px;line-height:1.5;">
                This is an automated notification from ${data.companyName}.<br />
                Please do not reply directly to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

export function generateLeaveRequestSubmittedEmail(data: LeaveRequestEmailData): string {
  const { employeeName, leaveType, startDate, endDate, daysCount, reason } = data;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:${DGC_OFF_WHITE};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;padding:20px;">
    ${generateEmailHeader(data)}
    <tr>
      <td style="background-color:#ffffff;padding:30px;">
        <!-- Action Required Badge -->
        <div style="text-align:center;margin-bottom:20px;">
          <span style="display:inline-block;background:linear-gradient(135deg,${DGC_DEEP_GREEN} 0%,${DGC_DEEP_GREEN_DARK} 100%);color:#ffffff;font-size:11px;font-weight:600;padding:6px 14px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;">
            Action Required
          </span>
        </div>
        
        <h2 style="color:#18181b;margin:0 0 15px 0;font-size:22px;text-align:center;font-weight:600;">Leave Request Submitted</h2>
        
        <p style="color:#52525b;margin:0 0 25px 0;line-height:1.6;text-align:center;font-size:15px;">
          <strong style="color:#18181b;">${employeeName}</strong> has submitted a leave request that requires your review.
        </p>
        
        <!-- Request Details Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#fafafa;border-radius:10px;border:1px solid #e5e7eb;margin-bottom:20px;">
          <tr>
            <td style="padding:20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:10px 0;color:#71717a;font-size:13px;border-bottom:1px solid #e5e7eb;">Leave Type</td>
                  <td style="padding:10px 0;color:#18181b;font-size:14px;text-align:right;font-weight:600;border-bottom:1px solid #e5e7eb;">
                    <span style="background-color:${DGC_GOLD}20;color:${DGC_GOLD};padding:4px 10px;border-radius:4px;">${leaveType}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;color:#71717a;font-size:13px;border-bottom:1px solid #e5e7eb;">Start Date</td>
                  <td style="padding:10px 0;color:#18181b;font-size:14px;text-align:right;border-bottom:1px solid #e5e7eb;">${format(new Date(startDate), "EEEE, MMM d, yyyy")}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;color:#71717a;font-size:13px;border-bottom:1px solid #e5e7eb;">End Date</td>
                  <td style="padding:10px 0;color:#18181b;font-size:14px;text-align:right;border-bottom:1px solid #e5e7eb;">${format(new Date(endDate), "EEEE, MMM d, yyyy")}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;color:#71717a;font-size:13px;">Total Duration</td>
                  <td style="padding:10px 0;color:${DGC_GOLD};font-size:16px;text-align:right;font-weight:700;">${daysCount} day${daysCount !== 1 ? "s" : ""}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        ${reason ? `
        <!-- Reason Section -->
        <div style="background-color:#f0f9ff;border-left:4px solid ${DGC_GOLD};padding:15px 18px;margin-bottom:20px;border-radius:0 8px 8px 0;">
          <p style="color:#71717a;margin:0 0 5px 0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Reason</p>
          <p style="color:#18181b;margin:0;font-size:14px;line-height:1.5;">${reason}</p>
        </div>
        ` : ""}
        
        <p style="color:#71717a;margin:0;font-size:13px;text-align:center;line-height:1.5;">
          Please log in to the HR portal to review and approve this request.
        </p>
      </td>
    </tr>
    ${generateEmailFooter(data)}
  </table>
</body>
</html>
`;
}

export function generateLeaveRequestApprovedEmail(data: LeaveRequestEmailData): string {
  const { employeeName, leaveType, startDate, endDate, daysCount, reviewerName } = data;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:${DGC_OFF_WHITE};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;padding:20px;">
    ${generateEmailHeader(data, { from: "#22c55e", to: "#16a34a" })}
    <tr>
      <td style="background-color:#ffffff;padding:30px;">
        <!-- Success Icon -->
        <div style="text-align:center;margin-bottom:20px;">
          <div style="display:inline-block;background-color:#dcfce7;border-radius:50%;width:70px;height:70px;line-height:70px;text-align:center;">
            <span style="font-size:32px;">✓</span>
          </div>
        </div>
        
        <h2 style="color:#18181b;margin:0 0 10px 0;font-size:22px;text-align:center;font-weight:600;">Leave Request Approved</h2>
        
        <p style="color:#52525b;margin:0 0 25px 0;line-height:1.6;text-align:center;font-size:15px;">
          Hi <strong style="color:#18181b;">${employeeName}</strong>, great news! Your leave request has been approved${reviewerName ? ` by <strong style="color:#18181b;">${reviewerName}</strong>` : ""}.
        </p>
        
        <!-- Approved Details Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f0fdf4;border-radius:10px;border:1px solid #bbf7d0;margin-bottom:20px;">
          <tr>
            <td style="padding:20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:10px 0;color:#71717a;font-size:13px;border-bottom:1px solid #bbf7d0;">Leave Type</td>
                  <td style="padding:10px 0;color:#18181b;font-size:14px;text-align:right;font-weight:600;border-bottom:1px solid #bbf7d0;">
                    <span style="background-color:#22c55e15;color:#16a34a;padding:4px 10px;border-radius:4px;">${leaveType}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;color:#71717a;font-size:13px;border-bottom:1px solid #bbf7d0;">Start Date</td>
                  <td style="padding:10px 0;color:#18181b;font-size:14px;text-align:right;border-bottom:1px solid #bbf7d0;">${format(new Date(startDate), "EEEE, MMM d, yyyy")}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;color:#71717a;font-size:13px;border-bottom:1px solid #bbf7d0;">End Date</td>
                  <td style="padding:10px 0;color:#18181b;font-size:14px;text-align:right;border-bottom:1px solid #bbf7d0;">${format(new Date(endDate), "EEEE, MMM d, yyyy")}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;color:#71717a;font-size:13px;">Total Duration</td>
                  <td style="padding:10px 0;color:#16a34a;font-size:16px;text-align:right;font-weight:700;">${daysCount} day${daysCount !== 1 ? "s" : ""}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <p style="color:#71717a;margin:0;font-size:13px;text-align:center;line-height:1.5;">
          Enjoy your time off! Don't forget to set your out-of-office message if needed.
        </p>
      </td>
    </tr>
    ${generateEmailFooter(data)}
  </table>
</body>
</html>
`;
}

export function generateLeaveRequestRejectedEmail(data: LeaveRequestEmailData): string {
  const { employeeName, leaveType, startDate, endDate, daysCount, rejectionReason, reviewerName } = data;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:${DGC_OFF_WHITE};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;padding:20px;">
    ${generateEmailHeader(data, { from: "#ef4444", to: "#dc2626" })}
    <tr>
      <td style="background-color:#ffffff;padding:30px;">
        <!-- Rejected Icon -->
        <div style="text-align:center;margin-bottom:20px;">
          <div style="display:inline-block;background-color:#fee2e2;border-radius:50%;width:70px;height:70px;line-height:70px;text-align:center;">
            <span style="font-size:32px;">✗</span>
          </div>
        </div>
        
        <h2 style="color:#18181b;margin:0 0 10px 0;font-size:22px;text-align:center;font-weight:600;">Leave Request Rejected</h2>
        
        <p style="color:#52525b;margin:0 0 25px 0;line-height:1.6;text-align:center;font-size:15px;">
          Hi <strong style="color:#18181b;">${employeeName}</strong>, unfortunately your leave request has been declined${reviewerName ? ` by <strong style="color:#18181b;">${reviewerName}</strong>` : ""}.
        </p>
        
        ${rejectionReason ? `
        <!-- Rejection Reason -->
        <div style="background-color:#fef2f2;border-left:4px solid #ef4444;padding:15px 18px;margin-bottom:20px;border-radius:0 8px 8px 0;">
          <p style="color:#b91c1c;margin:0 0 5px 0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Rejection Reason</p>
          <p style="color:#7f1d1d;margin:0;font-size:14px;line-height:1.5;">${rejectionReason}</p>
        </div>
        ` : ""}
        
        <!-- Request Details Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#fafafa;border-radius:10px;border:1px solid #e5e7eb;margin-bottom:20px;">
          <tr>
            <td style="padding:20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:10px 0;color:#71717a;font-size:13px;border-bottom:1px solid #e5e7eb;">Leave Type</td>
                  <td style="padding:10px 0;color:#18181b;font-size:14px;text-align:right;font-weight:600;border-bottom:1px solid #e5e7eb;">${leaveType}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;color:#71717a;font-size:13px;border-bottom:1px solid #e5e7eb;">Requested Dates</td>
                  <td style="padding:10px 0;color:#18181b;font-size:14px;text-align:right;border-bottom:1px solid #e5e7eb;">${format(new Date(startDate), "MMM d")} - ${format(new Date(endDate), "MMM d, yyyy")}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;color:#71717a;font-size:13px;">Duration</td>
                  <td style="padding:10px 0;color:#71717a;font-size:14px;text-align:right;">${daysCount} day${daysCount !== 1 ? "s" : ""}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <p style="color:#71717a;margin:0;font-size:13px;text-align:center;line-height:1.5;">
          If you have questions, please speak with your manager or HR department.
        </p>
      </td>
    </tr>
    ${generateEmailFooter(data)}
  </table>
</body>
</html>
`;
}

export function generatePayslipEmail(data: PayslipEmailData): string {
  const { employeeName, payPeriodStart, payPeriodEnd, netPay, currency } = data;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:${DGC_OFF_WHITE};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;padding:20px;">
    ${generateEmailHeader(data)}
    <tr>
      <td style="background-color:#ffffff;padding:30px;">
        <!-- Payslip Icon -->
        <div style="text-align:center;margin-bottom:20px;">
          <div style="display:inline-block;background:linear-gradient(135deg,${DGC_GOLD}20 0%,${DGC_GOLD}10 100%);border-radius:50%;width:70px;height:70px;line-height:70px;text-align:center;">
            <span style="font-size:32px;">💰</span>
          </div>
        </div>
        
        <h2 style="color:#18181b;margin:0 0 10px 0;font-size:22px;text-align:center;font-weight:600;">Your Payslip is Ready</h2>
        
        <p style="color:#52525b;margin:0 0 25px 0;line-height:1.6;text-align:center;font-size:15px;">
          Hi <strong style="color:#18181b;">${employeeName}</strong>, your payslip for <strong style="color:#18181b;">${format(new Date(payPeriodStart), "MMMM yyyy")}</strong> is now available.
        </p>
        
        <!-- Net Pay Highlight -->
        <div style="background:linear-gradient(135deg,${DGC_DEEP_GREEN} 0%,${DGC_DEEP_GREEN_DARK} 100%);border-radius:12px;padding:25px;margin-bottom:20px;text-align:center;">
          <p style="color:rgba(255,255,255,0.8);margin:0 0 8px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Net Pay</p>
          <p style="color:#ffffff;margin:0;font-size:32px;font-weight:700;">${currency} ${netPay}</p>
        </div>
        
        <!-- Pay Period Details -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#fafafa;border-radius:10px;border:1px solid #e5e7eb;margin-bottom:20px;">
          <tr>
            <td style="padding:20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:10px 0;color:#71717a;font-size:13px;">Pay Period</td>
                  <td style="padding:10px 0;color:#18181b;font-size:14px;text-align:right;font-weight:500;">${format(new Date(payPeriodStart), "MMM d")} - ${format(new Date(payPeriodEnd), "MMM d, yyyy")}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;color:#71717a;font-size:13px;border-top:1px solid #e5e7eb;">Status</td>
                  <td style="padding:10px 0;text-align:right;border-top:1px solid #e5e7eb;">
                    <span style="background-color:#dcfce7;color:#16a34a;padding:4px 10px;border-radius:4px;font-size:12px;font-weight:600;">Issued</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <p style="color:#71717a;margin:0;font-size:13px;text-align:center;line-height:1.5;">
          Please log in to the HR portal to download your detailed payslip.<br />
          Contact HR if you have any questions about your compensation.
        </p>
      </td>
    </tr>
    ${generateEmailFooter(data)}
  </table>
</body>
</html>
`;
}
