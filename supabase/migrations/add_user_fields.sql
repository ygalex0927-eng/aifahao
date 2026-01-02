-- Add username and is_admin columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create an index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
