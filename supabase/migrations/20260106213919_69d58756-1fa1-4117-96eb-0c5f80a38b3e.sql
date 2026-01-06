-- Add dashboard card visibility settings to company_settings
ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS dashboard_card_visibility JSONB DEFAULT '{
  "metrics": true,
  "timeTracker": true,
  "projectEvaluation": true,
  "calendarWidget": true,
  "workHoursChart": true,
  "dailyTimeLimits": true,
  "meetingCards": true,
  "announcements": true,
  "attendanceOverview": true
}'::jsonb;