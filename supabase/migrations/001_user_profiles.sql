-- Create user_profiles table
-- This table stores profile information for staff members in the grooming salon
-- The id must match the Supabase Auth user id (auth.users.id)

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'groomer', 'receptionist')),
    organization_id UUID NOT NULL,
    
    -- Address information
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    
    -- Employment details
    hire_date DATE,
    position TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    
    -- Grooming specialties and skills
    specialties TEXT[],
    can_be_booked BOOLEAN DEFAULT true,
    bookable_services UUID[],
    
    -- Compensation settings
    commission_enabled BOOLEAN DEFAULT false,
    commission_percent NUMERIC(5,2) DEFAULT 0,
    hourly_pay_enabled BOOLEAN DEFAULT false,
    hourly_rate NUMERIC(10,2) DEFAULT 0,
    salary_enabled BOOLEAN DEFAULT false,
    salary_amount NUMERIC(10,2) DEFAULT 0,
    weekly_guarantee_enabled BOOLEAN DEFAULT false,
    weekly_guarantee NUMERIC(10,2) DEFAULT 0,
    guarantee_payout_method TEXT CHECK (guarantee_payout_method IN ('both', 'higher')),
    
    -- Additional metadata
    notes TEXT,
    rating NUMERIC(3,2) DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on organization_id for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_organization_id ON public.user_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON public.user_profiles(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
    ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = id);

-- RLS Policy: Users in the same organization can read each other's profiles
CREATE POLICY "Users can read profiles in same organization"
    ON public.user_profiles
    FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM public.user_profiles 
            WHERE id = auth.uid()
        )
    );

-- RLS Policy: Only admins and managers can insert new profiles
CREATE POLICY "Admins and managers can insert profiles"
    ON public.user_profiles
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager')
            AND organization_id = user_profiles.organization_id
        )
    );

-- RLS Policy: Only admins and managers can update profiles in their organization
CREATE POLICY "Admins and managers can update profiles"
    ON public.user_profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 
            FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager')
            AND organization_id = user_profiles.organization_id
        )
    );

-- RLS Policy: Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
    ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id 
        -- Prevent users from changing their role or organization
        AND role = (SELECT role FROM public.user_profiles WHERE id = auth.uid())
        AND organization_id = (SELECT organization_id FROM public.user_profiles WHERE id = auth.uid())
    );

-- RLS Policy: Only admins can delete profiles
CREATE POLICY "Only admins can delete profiles"
    ON public.user_profiles
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 
            FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND organization_id = user_profiles.organization_id
        )
    );

-- Create function to automatically create user profile after auth.users insert
-- This is called by the Edge Function or API, not automatically
CREATE OR REPLACE FUNCTION public.create_user_profile(
    user_id UUID,
    user_email TEXT,
    user_first_name TEXT,
    user_last_name TEXT,
    user_phone TEXT,
    user_role TEXT,
    user_org_id UUID,
    user_metadata JSONB DEFAULT '{}'
)
RETURNS public.user_profiles AS $$
DECLARE
    new_profile public.user_profiles;
BEGIN
    INSERT INTO public.user_profiles (
        id,
        email,
        first_name,
        last_name,
        phone,
        role,
        organization_id,
        status,
        metadata
    )
    VALUES (
        user_id,
        user_email,
        user_first_name,
        user_last_name,
        user_phone,
        user_role,
        user_org_id,
        'pending',
        user_metadata
    )
    RETURNING * INTO new_profile;
    
    RETURN new_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile TO authenticated;
