-- Add column to track if a leave request will result in negative balance
ALTER TABLE leave_requests 
ADD COLUMN results_in_negative_balance boolean DEFAULT false;