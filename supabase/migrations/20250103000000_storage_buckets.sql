-- Storage Buckets and Policies
-- This migration creates storage buckets and RLS policies for file management

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Create avatars bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  false,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create pet-photos bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pet-photos',
  'pet-photos',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create receipts bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts',
  false,
  5242880, -- 5MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES - AVATARS BUCKET
-- ============================================================================

-- Users can upload their own avatar
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can view their own avatar
CREATE POLICY "Users can view own avatar"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own avatar
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- STORAGE POLICIES - PET PHOTOS BUCKET
-- ============================================================================

-- Customers can upload photos for their pets, staff can upload for any pet
CREATE POLICY "Customers can upload pet photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'pet-photos' AND (
      -- Staff/admin can upload any pet photo
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('staff', 'admin')
      ) OR
      -- Customer can upload photo for their pet
      EXISTS (
        SELECT 1 FROM public.pets p
        JOIN public.customers c ON p.customer_id = c.id
        WHERE p.id::text = (storage.foldername(name))[1]
        AND c.user_id = auth.uid()
      )
    )
  );

-- Customers can view photos of their pets, staff can view all
CREATE POLICY "Users can view pet photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'pet-photos' AND (
      -- Staff/admin can view all pet photos
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('staff', 'admin')
      ) OR
      -- Customer can view photos of their pets
      EXISTS (
        SELECT 1 FROM public.pets p
        JOIN public.customers c ON p.customer_id = c.id
        WHERE p.id::text = (storage.foldername(name))[1]
        AND c.user_id = auth.uid()
      )
    )
  );

-- Customers can update photos of their pets, staff can update all
CREATE POLICY "Users can update pet photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'pet-photos' AND (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('staff', 'admin')
      ) OR
      EXISTS (
        SELECT 1 FROM public.pets p
        JOIN public.customers c ON p.customer_id = c.id
        WHERE p.id::text = (storage.foldername(name))[1]
        AND c.user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    bucket_id = 'pet-photos' AND (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('staff', 'admin')
      ) OR
      EXISTS (
        SELECT 1 FROM public.pets p
        JOIN public.customers c ON p.customer_id = c.id
        WHERE p.id::text = (storage.foldername(name))[1]
        AND c.user_id = auth.uid()
      )
    )
  );

-- Customers can delete photos of their pets, staff can delete all
CREATE POLICY "Users can delete pet photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'pet-photos' AND (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('staff', 'admin')
      ) OR
      EXISTS (
        SELECT 1 FROM public.pets p
        JOIN public.customers c ON p.customer_id = c.id
        WHERE p.id::text = (storage.foldername(name))[1]
        AND c.user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- STORAGE POLICIES - RECEIPTS BUCKET
-- ============================================================================

-- Staff can upload receipts
CREATE POLICY "Staff can upload receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'receipts' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

-- Customers can view their own receipts, staff can view all
CREATE POLICY "Users can view receipts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'receipts' AND (
      -- Staff/admin can view all receipts
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('staff', 'admin')
      ) OR
      -- Customer can view their own receipts
      EXISTS (
        SELECT 1 FROM public.transactions t
        JOIN public.customers c ON t.customer_id = c.id
        WHERE t.id::text = (storage.foldername(name))[1]
        AND c.user_id = auth.uid()
      )
    )
  );

-- Only staff can update receipts
CREATE POLICY "Staff can update receipts"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'receipts' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  )
  WITH CHECK (
    bucket_id = 'receipts' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

-- Only admins can delete receipts
CREATE POLICY "Admins can delete receipts"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'receipts' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS FOR STORAGE
-- ============================================================================

-- Function to get avatar URL for a user
CREATE OR REPLACE FUNCTION public.get_avatar_url(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  avatar_path TEXT;
BEGIN
  SELECT avatar_url INTO avatar_path
  FROM public.profiles
  WHERE id = user_id;
  
  IF avatar_path IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Return the full public URL
  RETURN avatar_path;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_avatar_url TO authenticated;

-- Function to get signed URL for pet photo (expires in 1 hour)
CREATE OR REPLACE FUNCTION public.get_pet_photo_url(pet_id UUID, filename TEXT)
RETURNS TEXT AS $$
DECLARE
  file_path TEXT;
BEGIN
  -- Verify user has access to this pet
  IF NOT EXISTS (
    SELECT 1 FROM public.pets p
    JOIN public.customers c ON p.customer_id = c.id
    WHERE p.id = pet_id AND (
      c.user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('staff', 'admin')
      )
    )
  ) THEN
    RAISE EXCEPTION 'Access denied to pet photos';
  END IF;
  
  file_path := pet_id::text || '/' || filename;
  
  -- Note: In production, use Supabase storage.from().createSignedUrl()
  -- This is a placeholder for the path
  RETURN file_path;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_pet_photo_url TO authenticated;

COMMENT ON POLICY "Users can upload own avatar" ON storage.objects IS 'Users can upload avatar to their own folder (user_id/)';
COMMENT ON POLICY "Customers can upload pet photos" ON storage.objects IS 'Customers can upload photos for their pets, staff can upload for any pet';
COMMENT ON POLICY "Staff can upload receipts" ON storage.objects IS 'Only staff and admins can upload receipts';
COMMENT ON FUNCTION public.get_avatar_url IS 'Returns avatar URL for a user';
COMMENT ON FUNCTION public.get_pet_photo_url IS 'Returns pet photo path with access check';
