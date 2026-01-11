CREATE OR REPLACE FUNCTION public.get_reports_overview(p_start_date date, p_end_date date)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_today DATE := CURRENT_DATE;
  v_month_start DATE := DATE_TRUNC('month', CURRENT_DATE)::DATE;
  v_month_end DATE := (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE;
  
  -- Result variables
  v_payroll JSONB;
  v_workforce JSONB;
  v_leave JSONB;
  v_loans JSONB;
  v_insights JSONB;
  
  -- Payroll variables
  v_total_gross JSONB;
  v_total_net JSONB;
  v_employer_gosi JSONB;
  v_employees_paid INT;
  v_pending_runs INT;
  
  -- Workforce variables
  v_total_active INT;
  v_new_hires INT;
  v_exits INT;
  
  -- Leave variables
  v_pending_approvals INT;
  v_on_leave_today INT;
  v_days_taken_mtd NUMERIC;
  
  -- Loan variables
  v_active_loans INT;
  v_outstanding_balance JSONB;
  v_installments_due INT;
  
  -- Insights variables
  v_highest_payroll_dept JSONB;
  v_most_loans_dept JSONB;
BEGIN
  -- Get current user for potential future role-based filtering
  v_user_id := auth.uid();
  
  -- === PAYROLL SNAPSHOT ===
  
  -- Get pending payroll runs count
  SELECT COUNT(*) INTO v_pending_runs
  FROM payroll_runs WHERE status = 'draft';
  
  -- Get payroll totals by currency (FIXED: location_id instead of work_location_id)
  WITH finalized_runs AS (
    SELECT pr.id, COALESCE(wl.currency, 'SAR') as currency
    FROM payroll_runs pr
    LEFT JOIN work_locations wl ON pr.location_id = wl.id
    WHERE pr.status IN ('finalized', 'payslips_issued')
      AND pr.pay_period_start >= p_start_date
      AND pr.pay_period_end <= p_end_date
  ),
  payroll_by_currency AS (
    SELECT 
      fr.currency as currency_code,
      SUM(pre.gross_pay) as total_gross,
      SUM(pre.net_pay) as total_net,
      SUM(pre.gosi_deduction * 1.2) as employer_gosi,
      COUNT(DISTINCT pre.employee_id) as employees_paid
    FROM payroll_run_employees pre
    JOIN finalized_runs fr ON pre.payroll_run_id = fr.id
    GROUP BY fr.currency
  )
  SELECT 
    COALESCE(jsonb_agg(jsonb_build_object('currencyCode', currency_code, 'amount', COALESCE(total_gross, 0))), '[]'::jsonb),
    COALESCE(jsonb_agg(jsonb_build_object('currencyCode', currency_code, 'amount', COALESCE(total_net, 0))), '[]'::jsonb),
    COALESCE(jsonb_agg(jsonb_build_object('currencyCode', currency_code, 'amount', COALESCE(employer_gosi, 0))), '[]'::jsonb),
    COALESCE(SUM(employees_paid)::INT, 0)
  INTO v_total_gross, v_total_net, v_employer_gosi, v_employees_paid
  FROM payroll_by_currency;
  
  v_payroll := jsonb_build_object(
    'totalGross', COALESCE(v_total_gross, '[]'::jsonb),
    'totalNet', COALESCE(v_total_net, '[]'::jsonb),
    'employerGosi', COALESCE(v_employer_gosi, '[]'::jsonb),
    'employeesPaid', COALESCE(v_employees_paid, 0),
    'pendingRuns', COALESCE(v_pending_runs, 0),
    'hasMixedCurrencies', (jsonb_array_length(COALESCE(v_total_gross, '[]'::jsonb)) > 1)
  );
  
  -- === WORKFORCE SNAPSHOT ===
  
  SELECT COUNT(*) INTO v_total_active FROM employees WHERE status = 'active';
  
  SELECT COUNT(*) INTO v_new_hires 
  FROM employees 
  WHERE status = 'active' 
    AND join_date >= v_month_start 
    AND join_date <= v_month_end;
  
  SELECT COUNT(*) INTO v_exits 
  FROM employees 
  WHERE status IN ('resigned', 'terminated') 
    AND updated_at >= v_month_start::timestamp 
    AND updated_at <= (v_month_end::timestamp + interval '1 day' - interval '1 second');
  
  v_workforce := jsonb_build_object(
    'totalActive', COALESCE(v_total_active, 0),
    'newHires', COALESCE(v_new_hires, 0),
    'exits', COALESCE(v_exits, 0)
  );
  
  -- === LEAVE SNAPSHOT ===
  
  SELECT COUNT(*) INTO v_pending_approvals FROM leave_requests WHERE status = 'pending';
  
  SELECT COUNT(*) INTO v_on_leave_today 
  FROM leave_requests 
  WHERE status = 'approved' 
    AND start_date <= v_today 
    AND end_date >= v_today;
  
  SELECT COALESCE(SUM(days_count), 0) INTO v_days_taken_mtd 
  FROM leave_requests 
  WHERE status = 'approved' 
    AND start_date >= v_month_start 
    AND start_date <= v_month_end;
  
  v_leave := jsonb_build_object(
    'pendingApprovals', COALESCE(v_pending_approvals, 0),
    'onLeaveToday', COALESCE(v_on_leave_today, 0),
    'daysTakenMTD', COALESCE(v_days_taken_mtd, 0)
  );
  
  -- === LOAN SNAPSHOT ===
  
  SELECT COUNT(*) INTO v_active_loans FROM loans WHERE status = 'active';
  
  SELECT COUNT(*) INTO v_installments_due 
  FROM loan_installments 
  WHERE status = 'due' 
    AND due_date >= v_month_start 
    AND due_date <= v_month_end;
  
  -- Outstanding balance by currency
  WITH loan_balances AS (
    SELECT 
      COALESCE(e.salary_currency_code, 'SAR') as currency_code,
      SUM(li.amount) as outstanding
    FROM loans l
    JOIN loan_installments li ON li.loan_id = l.id
    JOIN employees e ON l.employee_id = e.id
    WHERE l.status = 'active' AND li.status != 'paid'
    GROUP BY COALESCE(e.salary_currency_code, 'SAR')
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object('currencyCode', currency_code, 'amount', COALESCE(outstanding, 0))), '[]'::jsonb)
  INTO v_outstanding_balance
  FROM loan_balances;
  
  v_loans := jsonb_build_object(
    'activeLoans', COALESCE(v_active_loans, 0),
    'outstandingBalance', COALESCE(v_outstanding_balance, '[]'::jsonb),
    'installmentsDueThisMonth', COALESCE(v_installments_due, 0),
    'hasMixedCurrencies', (jsonb_array_length(COALESCE(v_outstanding_balance, '[]'::jsonb)) > 1)
  );
  
  -- === INSIGHTS ===
  
  -- Highest payroll department
  WITH dept_payroll AS (
    SELECT 
      d.name as dept_name,
      COALESCE(e.salary_currency_code, 'SAR') as currency_code,
      SUM(pre.gross_pay) as total
    FROM payroll_run_employees pre
    JOIN payroll_runs pr ON pre.payroll_run_id = pr.id
    JOIN employees e ON pre.employee_id = e.id
    JOIN departments d ON e.department_id = d.id
    WHERE pr.status IN ('finalized', 'payslips_issued')
      AND pr.pay_period_start >= p_start_date
      AND pr.pay_period_end <= p_end_date
    GROUP BY d.name, COALESCE(e.salary_currency_code, 'SAR')
    ORDER BY total DESC
    LIMIT 1
  )
  SELECT jsonb_build_object('name', dept_name, 'amount', total, 'currencyCode', currency_code)
  INTO v_highest_payroll_dept
  FROM dept_payroll;
  
  -- Department with most loans
  WITH dept_loans AS (
    SELECT d.name as dept_name, COUNT(*) as loan_count
    FROM loans l
    JOIN employees e ON l.employee_id = e.id
    JOIN departments d ON e.department_id = d.id
    WHERE l.status = 'active'
    GROUP BY d.name
    ORDER BY loan_count DESC
    LIMIT 1
  )
  SELECT jsonb_build_object('name', dept_name, 'count', loan_count)
  INTO v_most_loans_dept
  FROM dept_loans;
  
  v_insights := jsonb_build_object(
    'highestPayrollDept', v_highest_payroll_dept,
    'mostLoansDept', v_most_loans_dept
  );
  
  -- === RETURN COMBINED RESULT ===
  
  RETURN jsonb_build_object(
    'payroll', v_payroll,
    'workforce', v_workforce,
    'leave', v_leave,
    'loans', v_loans,
    'insights', v_insights
  );
END;
$function$;