import { format } from "date-fns";

interface BaseEmailData {
  companyName: string;
  companyLogo?: string;
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

export function generateLeaveRequestSubmittedEmail(data: LeaveRequestEmailData): string {
  const { companyName, employeeName, leaveType, startDate, endDate, daysCount, reason } = data;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <tr>
      <td style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${companyName}</h1>
      </td>
    </tr>
    <tr>
      <td style="background-color: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #18181b; margin: 0 0 20px 0; font-size: 20px;">Leave Request Submitted</h2>
        
        <p style="color: #52525b; margin: 0 0 20px 0; line-height: 1.6;">
          <strong>${employeeName}</strong> has submitted a leave request that requires your review.
        </p>
        
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; border-radius: 8px; margin-bottom: 20px;">
          <tr>
            <td style="padding: 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Leave Type</td>
                  <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right; font-weight: 600;">${leaveType}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #71717a; font-size: 14px;">From</td>
                  <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right;">${format(new Date(startDate), "MMM d, yyyy")}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #71717a; font-size: 14px;">To</td>
                  <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right;">${format(new Date(endDate), "MMM d, yyyy")}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Duration</td>
                  <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right; font-weight: 600;">${daysCount} day${daysCount !== 1 ? "s" : ""}</td>
                </tr>
                ${reason ? `
                <tr>
                  <td colspan="2" style="padding: 12px 0 0 0; border-top: 1px solid #e4e4e7; color: #52525b; font-size: 14px;">
                    <strong>Reason:</strong> ${reason}
                  </td>
                </tr>
                ` : ""}
              </table>
            </td>
          </tr>
        </table>
        
        <p style="color: #71717a; margin: 20px 0 0 0; font-size: 12px; text-align: center;">
          This is an automated notification from ${companyName}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export function generateLeaveRequestApprovedEmail(data: LeaveRequestEmailData): string {
  const { companyName, employeeName, leaveType, startDate, endDate, daysCount, reviewerName } = data;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <tr>
      <td style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${companyName}</h1>
      </td>
    </tr>
    <tr>
      <td style="background-color: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="display: inline-block; background-color: #dcfce7; border-radius: 50%; padding: 15px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>
        
        <h2 style="color: #18181b; margin: 0 0 10px 0; font-size: 20px; text-align: center;">Leave Request Approved</h2>
        
        <p style="color: #52525b; margin: 0 0 20px 0; line-height: 1.6; text-align: center;">
          Hi ${employeeName}, your leave request has been approved${reviewerName ? ` by ${reviewerName}` : ""}.
        </p>
        
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; border-radius: 8px; margin-bottom: 20px;">
          <tr>
            <td style="padding: 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Leave Type</td>
                  <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right; font-weight: 600;">${leaveType}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #71717a; font-size: 14px;">From</td>
                  <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right;">${format(new Date(startDate), "MMM d, yyyy")}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #71717a; font-size: 14px;">To</td>
                  <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right;">${format(new Date(endDate), "MMM d, yyyy")}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Duration</td>
                  <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right; font-weight: 600;">${daysCount} day${daysCount !== 1 ? "s" : ""}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <p style="color: #71717a; margin: 20px 0 0 0; font-size: 12px; text-align: center;">
          This is an automated notification from ${companyName}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export function generateLeaveRequestRejectedEmail(data: LeaveRequestEmailData): string {
  const { companyName, employeeName, leaveType, startDate, endDate, daysCount, rejectionReason, reviewerName } = data;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <tr>
      <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${companyName}</h1>
      </td>
    </tr>
    <tr>
      <td style="background-color: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="display: inline-block; background-color: #fee2e2; border-radius: 50%; padding: 15px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
        </div>
        
        <h2 style="color: #18181b; margin: 0 0 10px 0; font-size: 20px; text-align: center;">Leave Request Rejected</h2>
        
        <p style="color: #52525b; margin: 0 0 20px 0; line-height: 1.6; text-align: center;">
          Hi ${employeeName}, your leave request has been rejected${reviewerName ? ` by ${reviewerName}` : ""}.
        </p>
        
        ${rejectionReason ? `
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
          <p style="color: #991b1b; margin: 0; font-size: 14px;">
            <strong>Reason:</strong> ${rejectionReason}
          </p>
        </div>
        ` : ""}
        
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; border-radius: 8px; margin-bottom: 20px;">
          <tr>
            <td style="padding: 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Leave Type</td>
                  <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right; font-weight: 600;">${leaveType}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #71717a; font-size: 14px;">From</td>
                  <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right;">${format(new Date(startDate), "MMM d, yyyy")}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #71717a; font-size: 14px;">To</td>
                  <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right;">${format(new Date(endDate), "MMM d, yyyy")}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Duration</td>
                  <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right; font-weight: 600;">${daysCount} day${daysCount !== 1 ? "s" : ""}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <p style="color: #71717a; margin: 20px 0 0 0; font-size: 12px; text-align: center;">
          This is an automated notification from ${companyName}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export function generatePayslipEmail(data: PayslipEmailData): string {
  const { companyName, employeeName, payPeriodStart, payPeriodEnd, netPay, currency } = data;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <tr>
      <td style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${companyName}</h1>
      </td>
    </tr>
    <tr>
      <td style="background-color: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="display: inline-block; background-color: #dbeafe; border-radius: 50%; padding: 15px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
        </div>
        
        <h2 style="color: #18181b; margin: 0 0 10px 0; font-size: 20px; text-align: center;">Your Payslip is Ready</h2>
        
        <p style="color: #52525b; margin: 0 0 20px 0; line-height: 1.6; text-align: center;">
          Hi ${employeeName}, your payslip for ${format(new Date(payPeriodStart), "MMMM yyyy")} is now available.
        </p>
        
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; border-radius: 8px; margin-bottom: 20px;">
          <tr>
            <td style="padding: 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Pay Period</td>
                  <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right;">${format(new Date(payPeriodStart), "MMM d")} - ${format(new Date(payPeriodEnd), "MMM d, yyyy")}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Net Pay</td>
                  <td style="padding: 8px 0; color: #3b82f6; font-size: 18px; text-align: right; font-weight: 700;">${currency} ${netPay}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <p style="color: #52525b; margin: 0 0 20px 0; line-height: 1.6; text-align: center; font-size: 14px;">
          Your payslip PDF is attached to this email.
        </p>
        
        <p style="color: #71717a; margin: 20px 0 0 0; font-size: 12px; text-align: center;">
          This is an automated notification from ${companyName}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}
