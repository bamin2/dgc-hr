-- Sync existing employee avatars to their linked profiles (one-time data sync)
UPDATE profiles p
SET avatar_url = e.avatar_url
FROM employees e
WHERE e.user_id = p.id
  AND e.avatar_url IS NOT NULL
  AND e.avatar_url != ''
  AND (p.avatar_url IS NULL OR p.avatar_url = '');