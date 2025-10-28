-- Authentication Triggers and Profile Management
-- This migration sets up automatic profile creation and auth-related triggers

-- ============================================================================
-- FUNCTION: Auto-create profile on user signup
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- FUNCTION: Update profile email when auth email changes
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_user_email_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Sync email from auth.users to profiles
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE public.profiles
    SET email = NEW.email,
        updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users for email updates
DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.handle_user_email_update();

-- ============================================================================
-- FUNCTION: Handle user deletion
-- ============================================================================
-- Note: Profile deletion is handled by CASCADE from auth.users FK
-- This function is for any cleanup operations needed

CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Log deletion for audit (if audit table exists)
  -- Custom cleanup logic can be added here
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users for deletion
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_deletion();

-- ============================================================================
-- RPC FUNCTION: Get current user's profile
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS SETOF public.profiles AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.profiles
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;

-- ============================================================================
-- RPC FUNCTION: Update current user's profile
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_my_profile(
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL
)
RETURNS public.profiles AS $$
DECLARE
  updated_profile public.profiles;
BEGIN
  UPDATE public.profiles
  SET
    first_name = COALESCE(p_first_name, first_name),
    last_name = COALESCE(p_last_name, last_name),
    phone = COALESCE(p_phone, phone),
    avatar_url = COALESCE(p_avatar_url, avatar_url),
    updated_at = NOW()
  WHERE id = auth.uid()
  RETURNING * INTO updated_profile;
  
  RETURN updated_profile;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.update_my_profile TO authenticated;

-- ============================================================================
-- RPC FUNCTION: Check if email is available
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_email_available(p_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = p_email
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute to anon (for signup form validation)
GRANT EXECUTE ON FUNCTION public.is_email_available TO anon;
GRANT EXECUTE ON FUNCTION public.is_email_available TO authenticated;

-- ============================================================================
-- VIEW: Current user's complete profile (with join)
-- ============================================================================
CREATE OR REPLACE VIEW public.my_profile_view AS
SELECT
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.phone,
  p.role,
  p.avatar_url,
  p.created_at,
  p.updated_at,
  u.email_confirmed_at,
  u.last_sign_in_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.id = auth.uid();

-- Grant select to authenticated users
GRANT SELECT ON public.my_profile_view TO authenticated;

COMMENT ON FUNCTION public.handle_new_user IS 'Automatically creates profile when new user signs up';
COMMENT ON FUNCTION public.handle_user_email_update IS 'Syncs email changes from auth.users to profiles';
COMMENT ON FUNCTION public.get_my_profile IS 'Returns current user''s profile';
COMMENT ON FUNCTION public.update_my_profile IS 'Updates current user''s profile fields';
COMMENT ON FUNCTION public.is_email_available IS 'Checks if email is available for signup';
COMMENT ON VIEW public.my_profile_view IS 'Current user''s complete profile with auth data';
