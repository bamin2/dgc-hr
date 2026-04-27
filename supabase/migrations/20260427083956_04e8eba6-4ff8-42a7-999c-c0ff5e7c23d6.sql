DELETE FROM leave_requests
WHERE id IN (
  SELECT id FROM (
    SELECT id,
      ROW_NUMBER() OVER (
        PARTITION BY employee_id, leave_type_id, start_date, end_date, days_count, status
        ORDER BY id
      ) AS rn
    FROM leave_requests
  ) t
  WHERE rn > 1
);