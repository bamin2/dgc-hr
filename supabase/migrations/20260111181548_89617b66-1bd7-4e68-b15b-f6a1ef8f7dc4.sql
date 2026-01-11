-- Create RPC function to consolidate dashboard metrics into a single call
-- Reduces 10 separate queries to 1, dramatically improving dashboard load time

CREATE OR REPLACE FUNCTION public.get_dashboard_metrics(
  p_attendance_limit INT DEFAULT 5,
  p_team_limit INT DEFAULT 4
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_today DATE := CURRENT_DATE;
  v_thirty_days_ago DATE := CURRENT_DATE - INTERVAL '30 days';
  v_sixty_days_ago DATE := CURRENT_DATE - INTERVAL '60 days';
  v_seven_days_ago DATE := CURRENT_DATE - INTERVAL '7 days';
  v_week_start DATE := DATE_TRUNC('week', CURRENT_DATE)::DATE;
  v_week_end DATE := (DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '6 days')::DATE;
  
  -- Metrics variables
  v_total_employees INT;
  v_new_hires INT;
  v_previous_new_hires INT;
  v_today_attendance INT;
  v_avg_work_hours NUMERIC;
  v_attendance_rate INT;
  
  -- Today attendance variables
  v_attendance_records JSONB;
  v_present_count INT;
  v_absent_count INT;
  
  -- Weekly work hours
  v_weekly_data JSONB;
  v_total_hours NUMERIC;
  v_overtime NUMERIC;
  v_daily_avg NUMERIC;
  
  -- Team time limits
  v_team_members JSONB;
BEGIN
  v_user_id := auth.uid();
  
  -- === METRICS CARDS ===
  
  -- Total active employees
  SELECT COUNT(*) INTO v_total_employees 
  FROM employees WHERE status = 'active';
  
  -- New hires in last 30 days
  SELECT COUNT(*) INTO v_new_hires 
  FROM employees WHERE created_at >= v_thirty_days_ago;
  
  -- Previous period new hires (30-60 days ago)
  SELECT COUNT(*) INTO v_previous_new_hires 
  FROM employees 
  WHERE created_at >= v_sixty_days_ago AND created_at < v_thirty_days_ago;
  
  -- Today's attendance (present, late, remote)
  SELECT COUNT(*) INTO v_today_attendance 
  FROM attendance_records 
  WHERE date = v_today AND status IN ('present', 'late', 'remote');
  
  -- Average work hours (last 7 days)
  SELECT COALESCE(AVG(work_hours), 0) INTO v_avg_work_hours
  FROM attendance_records 
  WHERE date >= v_seven_days_ago AND work_hours IS NOT NULL;
  
  -- Attendance rate
  v_attendance_rate := CASE 
    WHEN v_total_employees > 0 
    THEN ROUND((v_today_attendance::NUMERIC / v_total_employees) * 100)
    ELSE 0 
  END;
  
  -- === TODAY ATTENDANCE RECORDS ===
  
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', ar.id,
      'check_in', ar.check_in,
      'status', ar.status,
      'employee', jsonb_build_object(
        'id', e.id,
        'first_name', e.first_name,
        'last_name', e.last_name,
        'avatar_url', e.avatar_url
      )
    ) ORDER BY ar.check_in DESC NULLS LAST
  ), '[]'::jsonb)
  INTO v_attendance_records
  FROM (
    SELECT id, employee_id, check_in, status 
    FROM attendance_records 
    WHERE date = v_today 
    ORDER BY check_in DESC NULLS LAST 
    LIMIT p_attendance_limit
  ) ar
  JOIN employees e ON ar.employee_id = e.id;
  
  -- Present count
  SELECT COUNT(*) INTO v_present_count 
  FROM attendance_records 
  WHERE date = v_today AND status IN ('present', 'late', 'remote');
  
  -- Absent count
  SELECT COUNT(*) INTO v_absent_count 
  FROM attendance_records 
  WHERE date = v_today AND status = 'absent';
  
  -- === WEEKLY WORK HOURS ===
  
  WITH daily_hours AS (
    SELECT 
      date,
      AVG(work_hours) as avg_hours
    FROM attendance_records
    WHERE date >= v_week_start AND date <= v_week_end AND work_hours IS NOT NULL
    GROUP BY date
  )
  SELECT 
    COALESCE(jsonb_agg(
      jsonb_build_object(
        'day', (ARRAY['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])[EXTRACT(DOW FROM day_date)::INT + 1],
        'date', day_date,
        'hours', COALESCE(dh.avg_hours, 0)
      ) ORDER BY day_date
    ), '[]'::jsonb),
    COALESCE(SUM(dh.avg_hours), 0)
  INTO v_weekly_data, v_total_hours
  FROM generate_series(v_week_start, v_week_end, '1 day'::interval) AS day_date
  LEFT JOIN daily_hours dh ON dh.date = day_date::DATE;
  
  -- Calculate overtime and daily average
  v_overtime := GREATEST(0, v_total_hours - 40);
  v_daily_avg := CASE 
    WHEN v_total_hours > 0 THEN v_total_hours / 7
    ELSE 0
  END;
  
  -- === TEAM TIME LIMITS ===
  
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', e.id,
      'name', e.first_name || ' ' || e.last_name,
      'role', COALESCE(p.title, 'Employee'),
      'avatar_url', e.avatar_url,
      'hours', COALESCE(ar.work_hours, 0),
      'maxHours', 8,
      'status', CASE
        WHEN ar.check_in IS NOT NULL AND ar.check_out IS NULL THEN 'online'
        WHEN ar.check_out IS NOT NULL THEN 'away'
        ELSE 'offline'
      END
    ) ORDER BY ar.check_in DESC NULLS LAST
  ), '[]'::jsonb)
  INTO v_team_members
  FROM (
    SELECT id, employee_id, work_hours, check_in, check_out
    FROM attendance_records
    WHERE date = v_today AND employee_id IS NOT NULL
    ORDER BY check_in DESC NULLS LAST
    LIMIT p_team_limit
  ) ar
  JOIN employees e ON ar.employee_id = e.id
  LEFT JOIN positions p ON e.position_id = p.id;
  
  -- === RETURN COMBINED RESULT ===
  
  RETURN jsonb_build_object(
    'metrics', jsonb_build_object(
      'totalEmployees', COALESCE(v_total_employees, 0),
      'newHires', COALESCE(v_new_hires, 0),
      'previousNewHires', COALESCE(v_previous_new_hires, 0),
      'todayAttendance', COALESCE(v_today_attendance, 0),
      'avgWorkHours', ROUND(COALESCE(v_avg_work_hours, 0)::NUMERIC, 1),
      'attendanceRate', COALESCE(v_attendance_rate, 0)
    ),
    'todayAttendance', jsonb_build_object(
      'records', v_attendance_records,
      'presentCount', COALESCE(v_present_count, 0),
      'absentCount', COALESCE(v_absent_count, 0)
    ),
    'weeklyWorkHours', jsonb_build_object(
      'data', v_weekly_data,
      'totalHours', ROUND(COALESCE(v_total_hours, 0)::NUMERIC, 1),
      'overtime', ROUND(COALESCE(v_overtime, 0)::NUMERIC, 1),
      'dailyAvg', ROUND(COALESCE(v_daily_avg, 0)::NUMERIC, 1)
    ),
    'teamTimeLimits', COALESCE(v_team_members, '[]'::jsonb)
  );
END;
$$;