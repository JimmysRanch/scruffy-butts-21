-- Scruffy Butts - Initial Database Schema
-- This migration creates all core tables with proper relationships, constraints, and RLS

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- PROFILES TABLE
-- Extends auth.users with additional user profile information
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'staff', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- ============================================================================
-- CUSTOMERS TABLE
-- Stores customer information for the grooming business
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Customers policies
CREATE POLICY "Customers can view own data"
    ON public.customers FOR SELECT
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

CREATE POLICY "Staff and admins can insert customers"
    ON public.customers FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

CREATE POLICY "Customers can update own data, staff and admins can update all"
    ON public.customers FOR UPDATE
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

-- Index for performance
CREATE INDEX idx_customers_user_id ON public.customers(user_id);
CREATE INDEX idx_customers_email ON public.customers(email);
CREATE INDEX idx_customers_created_at ON public.customers(created_at DESC);

-- ============================================================================
-- PETS TABLE
-- Stores pet information linked to customers
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    breed TEXT NOT NULL,
    size TEXT CHECK (size IN ('small', 'medium', 'large')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- Pets policies (inherit from customer access)
CREATE POLICY "Users can view pets for their customers"
    ON public.pets FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.customers
            WHERE id = pets.customer_id AND (
                auth.uid() = user_id OR
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid() AND role IN ('staff', 'admin')
                )
            )
        )
    );

CREATE POLICY "Staff and admins can insert pets"
    ON public.pets FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

CREATE POLICY "Users can update pets for their customers"
    ON public.pets FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.customers
            WHERE id = pets.customer_id AND (
                auth.uid() = user_id OR
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid() AND role IN ('staff', 'admin')
                )
            )
        )
    );

CREATE POLICY "Users can delete pets for their customers"
    ON public.pets FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.customers
            WHERE id = pets.customer_id AND (
                auth.uid() = user_id OR
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid() AND role IN ('staff', 'admin')
                )
            )
        )
    );

-- Index for performance
CREATE INDEX idx_pets_customer_id ON public.pets(customer_id);

-- ============================================================================
-- SERVICES TABLE
-- Catalog of grooming services offered
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- in minutes
    price DECIMAL(10, 2) NOT NULL,
    category TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Services policies
CREATE POLICY "Anyone can view active services"
    ON public.services FOR SELECT
    USING (active = true OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('staff', 'admin')
    ));

CREATE POLICY "Only admins can insert services"
    ON public.services FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can update services"
    ON public.services FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Index for performance
CREATE INDEX idx_services_category ON public.services(category);
CREATE INDEX idx_services_active ON public.services(active);

-- ============================================================================
-- STAFF_MEMBERS TABLE
-- Staff information and configuration
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.staff_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    position TEXT NOT NULL,
    hire_date DATE NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    specialties TEXT[] DEFAULT '{}',
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    rating DECIMAL(3, 2) DEFAULT 0.00,
    color TEXT, -- for calendar display
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

-- Staff policies
CREATE POLICY "Staff can view all staff members"
    ON public.staff_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

CREATE POLICY "Only admins can insert staff members"
    ON public.staff_members FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all, staff can update own record"
    ON public.staff_members FOR UPDATE
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Index for performance
CREATE INDEX idx_staff_members_user_id ON public.staff_members(user_id);
CREATE INDEX idx_staff_members_status ON public.staff_members(status);
CREATE INDEX idx_staff_members_email ON public.staff_members(email);

-- ============================================================================
-- STAFF_SERVICE_AVAILABILITY TABLE
-- Tracks which services each staff member can perform
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.staff_service_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(staff_id, service_id)
);

-- Enable RLS
ALTER TABLE public.staff_service_availability ENABLE ROW LEVEL SECURITY;

-- Staff service availability policies
CREATE POLICY "Staff can view service availability"
    ON public.staff_service_availability FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

CREATE POLICY "Only admins can manage service availability"
    ON public.staff_service_availability FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Index for performance
CREATE INDEX idx_staff_service_staff_id ON public.staff_service_availability(staff_id);
CREATE INDEX idx_staff_service_service_id ON public.staff_service_availability(service_id);

-- ============================================================================
-- APPOINTMENTS TABLE
-- Core appointment scheduling and tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    staff_id UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    price DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (
        status IN ('scheduled', 'confirmed', 'checked-in', 'in-progress', 
                   'ready-for-pickup', 'completed', 'cancelled', 'no-show')
    ),
    notes TEXT,
    reminder_sent BOOLEAN DEFAULT false,
    confirmation_sent BOOLEAN DEFAULT false,
    pickup_notification_sent BOOLEAN DEFAULT false,
    customer_arrived BOOLEAN DEFAULT false,
    checked_in_at TIMESTAMPTZ,
    checked_out_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Appointments policies
CREATE POLICY "Customers can view their own appointments"
    ON public.appointments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.customers
            WHERE id = appointments.customer_id AND auth.uid() = user_id
        ) OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

CREATE POLICY "Staff and admins can insert appointments"
    ON public.appointments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

CREATE POLICY "Staff and admins can update appointments"
    ON public.appointments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

CREATE POLICY "Only admins can delete appointments"
    ON public.appointments FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Indexes for performance
CREATE INDEX idx_appointments_customer_id ON public.appointments(customer_id);
CREATE INDEX idx_appointments_pet_id ON public.appointments(pet_id);
CREATE INDEX idx_appointments_staff_id ON public.appointments(staff_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date DESC);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_appointments_date_time ON public.appointments(appointment_date, start_time);

-- ============================================================================
-- TRANSACTIONS TABLE
-- Payment and transaction records
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    staff_id UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    tip DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'cashapp', 'chime')),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    transaction_time TIME NOT NULL DEFAULT CURRENT_TIME,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Transactions policies
CREATE POLICY "Customers can view their own transactions"
    ON public.transactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.customers
            WHERE id = transactions.customer_id AND auth.uid() = user_id
        ) OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

CREATE POLICY "Staff and admins can insert transactions"
    ON public.transactions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

CREATE POLICY "Only admins can update transactions"
    ON public.transactions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Indexes for performance
CREATE INDEX idx_transactions_customer_id ON public.transactions(customer_id);
CREATE INDEX idx_transactions_appointment_id ON public.transactions(appointment_id);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date DESC);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);

-- ============================================================================
-- TRANSACTION_ITEMS TABLE
-- Line items for transactions (services and products)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.transaction_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('service', 'product')),
    item_id UUID, -- references service or inventory item
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    is_original_appointment_service BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;

-- Transaction items policies
CREATE POLICY "Users can view transaction items for their transactions"
    ON public.transaction_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.transactions t
            LEFT JOIN public.customers c ON c.id = t.customer_id
            WHERE t.id = transaction_items.transaction_id AND (
                auth.uid() = c.user_id OR
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid() AND role IN ('staff', 'admin')
                )
            )
        )
    );

CREATE POLICY "Staff and admins can manage transaction items"
    ON public.transaction_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

-- Index for performance
CREATE INDEX idx_transaction_items_transaction_id ON public.transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_item_type ON public.transaction_items(item_type);

-- ============================================================================
-- INVENTORY_ITEMS TABLE
-- Inventory management for supplies and retail products
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (
        category IN ('shampoo', 'conditioner', 'tools', 'accessories', 'treats', 'retail', 'other')
    ),
    sku TEXT UNIQUE,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'each',
    reorder_level INTEGER NOT NULL DEFAULT 0,
    reorder_quantity INTEGER NOT NULL DEFAULT 0,
    cost_per_unit DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    selling_price DECIMAL(10, 2),
    supplier TEXT,
    notes TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- Inventory items policies
CREATE POLICY "Staff can view inventory items"
    ON public.inventory_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

CREATE POLICY "Only admins can manage inventory items"
    ON public.inventory_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Indexes for performance
CREATE INDEX idx_inventory_items_category ON public.inventory_items(category);
CREATE INDEX idx_inventory_items_sku ON public.inventory_items(sku);
CREATE INDEX idx_inventory_items_active ON public.inventory_items(active);

-- ============================================================================
-- INVENTORY_TRANSACTIONS TABLE
-- Track inventory changes (restocks, usage, sales, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (
        transaction_type IN ('restock', 'usage', 'sale', 'adjustment', 'expired', 'damaged')
    ),
    quantity INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    cost DECIMAL(10, 2),
    notes TEXT,
    reference_id UUID, -- could link to transaction or appointment
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Inventory transactions policies
CREATE POLICY "Staff can view inventory transactions"
    ON public.inventory_transactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

CREATE POLICY "Staff and admins can insert inventory transactions"
    ON public.inventory_transactions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

-- Index for performance
CREATE INDEX idx_inventory_transactions_item_id ON public.inventory_transactions(item_id);
CREATE INDEX idx_inventory_transactions_created_at ON public.inventory_transactions(created_at DESC);

-- ============================================================================
-- STAFF_SCHEDULES TABLE
-- Regular staff scheduling
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.staff_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.staff_schedules ENABLE ROW LEVEL SECURITY;

-- Staff schedules policies
CREATE POLICY "Staff can view schedules"
    ON public.staff_schedules FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

CREATE POLICY "Only admins can manage schedules"
    ON public.staff_schedules FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Index for performance
CREATE INDEX idx_staff_schedules_staff_id ON public.staff_schedules(staff_id);
CREATE INDEX idx_staff_schedules_day ON public.staff_schedules(day_of_week);

-- ============================================================================
-- STAFF_TIME_OFF TABLE
-- Track staff time off requests and approvals
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.staff_time_off (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.staff_time_off ENABLE ROW LEVEL SECURITY;

-- Staff time off policies
CREATE POLICY "Staff can view own time off requests"
    ON public.staff_time_off FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_members
            WHERE id = staff_time_off.staff_id AND auth.uid() = user_id
        ) OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Staff can create own time off requests"
    ON public.staff_time_off FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.staff_members
            WHERE id = staff_time_off.staff_id AND auth.uid() = user_id
        )
    );

CREATE POLICY "Only admins can approve time off"
    ON public.staff_time_off FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Index for performance
CREATE INDEX idx_staff_time_off_staff_id ON public.staff_time_off(staff_id);
CREATE INDEX idx_staff_time_off_dates ON public.staff_time_off(start_date, end_date);
CREATE INDEX idx_staff_time_off_status ON public.staff_time_off(status);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON public.pets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_members_updated_at BEFORE UPDATE ON public.staff_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_schedules_updated_at BEFORE UPDATE ON public.staff_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_time_off_updated_at BEFORE UPDATE ON public.staff_time_off
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check for appointment conflicts
CREATE OR REPLACE FUNCTION check_appointment_conflict(
    p_staff_id UUID,
    p_appointment_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_appointment_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    conflict_count INTEGER;
BEGIN
    -- If no staff assigned, no conflict possible
    IF p_staff_id IS NULL THEN
        RETURN FALSE;
    END IF;

    SELECT COUNT(*) INTO conflict_count
    FROM public.appointments
    WHERE staff_id = p_staff_id
        AND appointment_date = p_appointment_date
        AND status NOT IN ('cancelled', 'no-show', 'completed')
        AND (p_appointment_id IS NULL OR id != p_appointment_id)
        AND (
            (start_time <= p_start_time AND end_time > p_start_time) OR
            (start_time < p_end_time AND end_time >= p_end_time) OR
            (start_time >= p_start_time AND end_time <= p_end_time)
        );

    RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_appointment_conflict TO authenticated;

COMMENT ON TABLE public.profiles IS 'User profiles extending auth.users';
COMMENT ON TABLE public.customers IS 'Customer information for grooming business';
COMMENT ON TABLE public.pets IS 'Pet profiles linked to customers';
COMMENT ON TABLE public.services IS 'Grooming service catalog';
COMMENT ON TABLE public.staff_members IS 'Staff member information and configuration';
COMMENT ON TABLE public.appointments IS 'Appointment scheduling and tracking';
COMMENT ON TABLE public.transactions IS 'Payment and transaction records';
COMMENT ON TABLE public.transaction_items IS 'Line items for transactions';
COMMENT ON TABLE public.inventory_items IS 'Inventory management for supplies and products';
COMMENT ON TABLE public.inventory_transactions IS 'Inventory change tracking';
COMMENT ON TABLE public.staff_schedules IS 'Regular staff scheduling';
COMMENT ON TABLE public.staff_time_off IS 'Staff time off requests and approvals';
