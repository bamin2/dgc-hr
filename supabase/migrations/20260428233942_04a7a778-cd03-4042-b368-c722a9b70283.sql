ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS sidebar_collapsed boolean NOT NULL DEFAULT false;