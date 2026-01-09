-- Create email_templates table
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  body_content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - only admins can manage templates
CREATE POLICY "Admins can view email templates"
ON public.email_templates
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'hr')
  )
);

CREATE POLICY "Admins can insert email templates"
ON public.email_templates
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update email templates"
ON public.email_templates
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create updated_at trigger
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default email templates
INSERT INTO public.email_templates (type, name, subject, description, body_content) VALUES
(
  'leave_request_submitted',
  'Leave Request Submitted',
  'Leave Request: {{employeeName}} - {{leaveType}}',
  'Sent to approvers when an employee submits a leave request',
  '<div style="text-align:center;margin-bottom:20px;"><span style="display:inline-block;background:linear-gradient(135deg,#804EEC 0%,#6B3FD4 100%);color:#ffffff;font-size:11px;font-weight:600;padding:6px 14px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;">Action Required</span></div><h2 style="color:#18181b;margin:0 0 15px 0;font-size:22px;text-align:center;font-weight:600;">Leave Request Submitted</h2><p style="color:#52525b;margin:0 0 25px 0;line-height:1.6;text-align:center;font-size:15px;"><strong style="color:#18181b;">{{employeeName}}</strong> has submitted a leave request that requires your review.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#fafafa;border-radius:10px;border:1px solid #e5e7eb;margin-bottom:20px;"><tr><td style="padding:20px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:10px 0;color:#71717a;font-size:13px;border-bottom:1px solid #e5e7eb;">Leave Type</td><td style="padding:10px 0;color:#18181b;font-size:14px;text-align:right;font-weight:600;border-bottom:1px solid #e5e7eb;"><span style="background-color:#804EEC15;color:#804EEC;padding:4px 10px;border-radius:4px;">{{leaveType}}</span></td></tr><tr><td style="padding:10px 0;color:#71717a;font-size:13px;border-bottom:1px solid #e5e7eb;">Start Date</td><td style="padding:10px 0;color:#18181b;font-size:14px;text-align:right;border-bottom:1px solid #e5e7eb;">{{startDate}}</td></tr><tr><td style="padding:10px 0;color:#71717a;font-size:13px;border-bottom:1px solid #e5e7eb;">End Date</td><td style="padding:10px 0;color:#18181b;font-size:14px;text-align:right;border-bottom:1px solid #e5e7eb;">{{endDate}}</td></tr><tr><td style="padding:10px 0;color:#71717a;font-size:13px;">Total Duration</td><td style="padding:10px 0;color:#804EEC;font-size:16px;text-align:right;font-weight:700;">{{daysCount}} day(s)</td></tr></table></td></tr></table>{{#reason}}<div style="background-color:#f0f9ff;border-left:4px solid #804EEC;padding:15px 18px;margin-bottom:20px;border-radius:0 8px 8px 0;"><p style="color:#71717a;margin:0 0 5px 0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Reason</p><p style="color:#18181b;margin:0;font-size:14px;line-height:1.5;">{{reason}}</p></div>{{/reason}}<p style="color:#71717a;margin:0;font-size:13px;text-align:center;line-height:1.5;">Please log in to the HR portal to review and approve this request.</p>'
),
(
  'leave_request_approved',
  'Leave Request Approved',
  'Leave Request Approved - {{leaveType}}',
  'Sent to employees when their leave request is approved',
  '<div style="text-align:center;margin-bottom:20px;"><div style="display:inline-block;background-color:#dcfce7;border-radius:50%;width:70px;height:70px;line-height:70px;text-align:center;"><span style="font-size:32px;">✓</span></div></div><h2 style="color:#18181b;margin:0 0 10px 0;font-size:22px;text-align:center;font-weight:600;">Leave Request Approved</h2><p style="color:#52525b;margin:0 0 25px 0;line-height:1.6;text-align:center;font-size:15px;">Hi <strong style="color:#18181b;">{{employeeName}}</strong>, great news! Your leave request has been approved{{#reviewerName}} by <strong style="color:#18181b;">{{reviewerName}}</strong>{{/reviewerName}}.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f0fdf4;border-radius:10px;border:1px solid #bbf7d0;margin-bottom:20px;"><tr><td style="padding:20px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:10px 0;color:#71717a;font-size:13px;border-bottom:1px solid #bbf7d0;">Leave Type</td><td style="padding:10px 0;color:#18181b;font-size:14px;text-align:right;font-weight:600;border-bottom:1px solid #bbf7d0;"><span style="background-color:#22c55e15;color:#16a34a;padding:4px 10px;border-radius:4px;">{{leaveType}}</span></td></tr><tr><td style="padding:10px 0;color:#71717a;font-size:13px;border-bottom:1px solid #bbf7d0;">Start Date</td><td style="padding:10px 0;color:#18181b;font-size:14px;text-align:right;border-bottom:1px solid #bbf7d0;">{{startDate}}</td></tr><tr><td style="padding:10px 0;color:#71717a;font-size:13px;border-bottom:1px solid #bbf7d0;">End Date</td><td style="padding:10px 0;color:#18181b;font-size:14px;text-align:right;border-bottom:1px solid #bbf7d0;">{{endDate}}</td></tr><tr><td style="padding:10px 0;color:#71717a;font-size:13px;">Total Duration</td><td style="padding:10px 0;color:#16a34a;font-size:16px;text-align:right;font-weight:700;">{{daysCount}} day(s)</td></tr></table></td></tr></table><p style="color:#71717a;margin:0;font-size:13px;text-align:center;line-height:1.5;">Enjoy your time off! Don''t forget to set your out-of-office message if needed.</p>'
),
(
  'leave_request_rejected',
  'Leave Request Rejected',
  'Leave Request Rejected - {{leaveType}}',
  'Sent to employees when their leave request is rejected',
  '<div style="text-align:center;margin-bottom:20px;"><div style="display:inline-block;background-color:#fee2e2;border-radius:50%;width:70px;height:70px;line-height:70px;text-align:center;"><span style="font-size:32px;">✗</span></div></div><h2 style="color:#18181b;margin:0 0 10px 0;font-size:22px;text-align:center;font-weight:600;">Leave Request Rejected</h2><p style="color:#52525b;margin:0 0 25px 0;line-height:1.6;text-align:center;font-size:15px;">Hi <strong style="color:#18181b;">{{employeeName}}</strong>, unfortunately your leave request has been declined{{#reviewerName}} by <strong style="color:#18181b;">{{reviewerName}}</strong>{{/reviewerName}}.</p>{{#rejectionReason}}<div style="background-color:#fef2f2;border-left:4px solid #ef4444;padding:15px 18px;margin-bottom:20px;border-radius:0 8px 8px 0;"><p style="color:#b91c1c;margin:0 0 5px 0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Rejection Reason</p><p style="color:#7f1d1d;margin:0;font-size:14px;line-height:1.5;">{{rejectionReason}}</p></div>{{/rejectionReason}}<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#fafafa;border-radius:10px;border:1px solid #e5e7eb;margin-bottom:20px;"><tr><td style="padding:20px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:10px 0;color:#71717a;font-size:13px;border-bottom:1px solid #e5e7eb;">Leave Type</td><td style="padding:10px 0;color:#18181b;font-size:14px;text-align:right;font-weight:600;border-bottom:1px solid #e5e7eb;">{{leaveType}}</td></tr><tr><td style="padding:10px 0;color:#71717a;font-size:13px;border-bottom:1px solid #e5e7eb;">Requested Dates</td><td style="padding:10px 0;color:#18181b;font-size:14px;text-align:right;border-bottom:1px solid #e5e7eb;">{{startDate}} - {{endDate}}</td></tr><tr><td style="padding:10px 0;color:#71717a;font-size:13px;">Duration</td><td style="padding:10px 0;color:#71717a;font-size:14px;text-align:right;">{{daysCount}} day(s)</td></tr></table></td></tr></table><p style="color:#71717a;margin:0;font-size:13px;text-align:center;line-height:1.5;">If you have questions, please speak with your manager or HR department.</p>'
),
(
  'payslip_issued',
  'Payslip Ready',
  'Your Payslip for {{payPeriod}} is Ready',
  'Sent to employees when their payslip is available',
  '<div style="text-align:center;margin-bottom:20px;"><div style="display:inline-block;background:linear-gradient(135deg,#804EEC20 0%,#804EEC10 100%);border-radius:50%;width:70px;height:70px;line-height:70px;text-align:center;"><span style="font-size:32px;">💰</span></div></div><h2 style="color:#18181b;margin:0 0 10px 0;font-size:22px;text-align:center;font-weight:600;">Your Payslip is Ready</h2><p style="color:#52525b;margin:0 0 25px 0;line-height:1.6;text-align:center;font-size:15px;">Hi <strong style="color:#18181b;">{{employeeName}}</strong>, your payslip for <strong style="color:#18181b;">{{payPeriod}}</strong> is now available.</p><div style="background:linear-gradient(135deg,#804EEC 0%,#6B3FD4 100%);border-radius:12px;padding:25px;margin-bottom:20px;text-align:center;"><p style="color:rgba(255,255,255,0.8);margin:0 0 8px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Net Pay</p><p style="color:#ffffff;margin:0;font-size:32px;font-weight:700;">{{currency}} {{netPay}}</p></div><p style="color:#71717a;margin:0;font-size:13px;text-align:center;line-height:1.5;">Log in to the HR portal to view your complete payslip details.</p>'
);