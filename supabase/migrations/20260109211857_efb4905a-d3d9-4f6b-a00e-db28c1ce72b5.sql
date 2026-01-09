-- Create email action tokens table for secure email-based approvals
CREATE TABLE public.email_action_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('approve', 'reject')),
  request_id UUID NOT NULL,
  request_type TEXT NOT NULL,
  step_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_email_action_tokens_token ON public.email_action_tokens(token);
CREATE INDEX idx_email_action_tokens_step_id ON public.email_action_tokens(step_id);
CREATE INDEX idx_email_action_tokens_expires_at ON public.email_action_tokens(expires_at);

-- Enable RLS
ALTER TABLE public.email_action_tokens ENABLE ROW LEVEL SECURITY;

-- No direct access policies - only service role can access via edge functions
-- This ensures tokens can only be created/consumed by our backend