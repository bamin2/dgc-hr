DO $$
DECLARE
  rec RECORD;
  delta NUMERIC;
  public_holiday_id UUID;
BEGIN
  SELECT id INTO public_holiday_id FROM leave_types WHERE name = 'Public Holiday' LIMIT 1;

  FOR rec IN
    SELECT
      lr.employee_id,
      lr.leave_type_id,
      SUM(lr.days_count)::numeric AS taken_2026
    FROM leave_requests lr
    WHERE lr.status = 'approved'
      AND lr.start_date >= DATE '2026-01-01'
      AND lr.start_date <= DATE '2026-12-31'
      AND (public_holiday_id IS NULL OR lr.leave_type_id <> public_holiday_id)
    GROUP BY lr.employee_id, lr.leave_type_id
  LOOP
    -- Try update first; if no row, insert
    UPDATE leave_balances lb
       SET used_days  = lb.used_days  + (rec.taken_2026 - lb.used_days),
           total_days = lb.total_days + (rec.taken_2026 - lb.used_days),
           updated_at = now()
     WHERE lb.employee_id = rec.employee_id
       AND lb.leave_type_id = rec.leave_type_id
       AND lb.year = 2026
       AND lb.used_days < rec.taken_2026;

    IF NOT FOUND THEN
      -- Insert if there is no row at all for this combination
      INSERT INTO leave_balances (employee_id, leave_type_id, year, total_days, used_days, pending_days)
      SELECT rec.employee_id, rec.leave_type_id, 2026, rec.taken_2026, rec.taken_2026, 0
      WHERE NOT EXISTS (
        SELECT 1 FROM leave_balances
         WHERE employee_id = rec.employee_id
           AND leave_type_id = rec.leave_type_id
           AND year = 2026
      );
    END IF;
  END LOOP;
END$$;