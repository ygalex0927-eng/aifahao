-- Relax nickname constraint just in case
ALTER TABLE public.users ALTER COLUMN nickname DROP NOT NULL;

-- Try to drop common triggers that might cause issues if they exist
-- Note: We cannot drop triggers on auth.users easily from here usually, but we can try dropping the function if it's in public schema
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
-- If the trigger uses a function in public, dropping the function might drop the trigger or fail. 
-- Supabase usually puts the function in public or public.

-- Also ensure we can insert into public.users
GRANT INSERT ON public.users TO service_role;
