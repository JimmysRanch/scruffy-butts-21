-- Seed data for Scruffy Butts development environment
-- This file provides realistic test data for local development

-- Note: This assumes you have created test users via Supabase Auth
-- You'll need to replace these UUIDs with actual auth.users IDs from your setup

-- ============================================================================
-- SERVICES
-- ============================================================================
INSERT INTO public.services (id, name, description, duration, price, category, active) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Full Groom - Small Dog', 'Complete grooming service including bath, haircut, nail trim, and ear cleaning for small dogs', 60, 45.00, 'Full Groom', true),
    ('550e8400-e29b-41d4-a716-446655440002', 'Full Groom - Medium Dog', 'Complete grooming service including bath, haircut, nail trim, and ear cleaning for medium dogs', 90, 65.00, 'Full Groom', true),
    ('550e8400-e29b-41d4-a716-446655440003', 'Full Groom - Large Dog', 'Complete grooming service including bath, haircut, nail trim, and ear cleaning for large dogs', 120, 85.00, 'Full Groom', true),
    ('550e8400-e29b-41d4-a716-446655440004', 'Bath & Brush - Small', 'Bath, brush out, and basic tidy up for small dogs', 30, 25.00, 'Bath & Brush', true),
    ('550e8400-e29b-41d4-a716-446655440005', 'Bath & Brush - Medium', 'Bath, brush out, and basic tidy up for medium dogs', 45, 35.00, 'Bath & Brush', true),
    ('550e8400-e29b-41d4-a716-446655440006', 'Bath & Brush - Large', 'Bath, brush out, and basic tidy up for large dogs', 60, 45.00, 'Bath & Brush', true),
    ('550e8400-e29b-41d4-a716-446655440007', 'Nail Trim', 'Quick nail trim service', 15, 15.00, 'Add-On', true),
    ('550e8400-e29b-41d4-a716-446655440008', 'Teeth Brushing', 'Dental hygiene service', 15, 12.00, 'Add-On', true),
    ('550e8400-e29b-41d4-a716-446655440009', 'De-shedding Treatment', 'Special treatment to reduce shedding', 30, 25.00, 'Add-On', true),
    ('550e8400-e29b-41d4-a716-446655440010', 'Flea & Tick Treatment', 'Professional flea and tick treatment', 20, 18.00, 'Add-On', true),
    ('550e8400-e29b-41d4-a716-446655440011', 'Puppy Introduction', 'Gentle first grooming experience for puppies', 45, 35.00, 'Special', true),
    ('550e8400-e29b-41d4-a716-446655440012', 'Senior Dog Care', 'Specialized gentle grooming for senior dogs', 60, 50.00, 'Special', true);

-- ============================================================================
-- INVENTORY ITEMS
-- ============================================================================
INSERT INTO public.inventory_items (id, name, category, sku, quantity, unit, reorder_level, reorder_quantity, cost_per_unit, selling_price, supplier, active) VALUES
    ('650e8400-e29b-41d4-a716-446655440001', 'Hypoallergenic Shampoo', 'shampoo', 'SH-001', 15, 'bottle', 5, 12, 8.50, 15.99, 'PetCo Wholesale', true),
    ('650e8400-e29b-41d4-a716-446655440002', 'Oatmeal Soothing Shampoo', 'shampoo', 'SH-002', 20, 'bottle', 5, 12, 7.25, 14.99, 'PetCo Wholesale', true),
    ('650e8400-e29b-41d4-a716-446655440003', 'Flea & Tick Shampoo', 'shampoo', 'SH-003', 8, 'bottle', 5, 12, 9.75, 17.99, 'Groomers Supply Co', true),
    ('650e8400-e29b-41d4-a716-446655440004', 'Moisturizing Conditioner', 'conditioner', 'CD-001', 12, 'bottle', 5, 10, 10.00, 18.99, 'PetCo Wholesale', true),
    ('650e8400-e29b-41d4-a716-446655440005', 'Detangling Conditioner', 'conditioner', 'CD-002', 10, 'bottle', 5, 10, 11.50, 19.99, 'Groomers Supply Co', true),
    ('650e8400-e29b-41d4-a716-446655440006', 'Grooming Scissors - 7"', 'tools', 'TL-001', 6, 'each', 2, 4, 25.00, NULL, 'Professional Grooming Tools', true),
    ('650e8400-e29b-41d4-a716-446655440007', 'Slicker Brush - Small', 'tools', 'TL-002', 8, 'each', 3, 6, 8.00, 18.99, 'Professional Grooming Tools', true),
    ('650e8400-e29b-41d4-a716-446655440008', 'Slicker Brush - Large', 'tools', 'TL-003', 8, 'each', 3, 6, 10.00, 22.99, 'Professional Grooming Tools', true),
    ('650e8400-e29b-41d4-a716-446655440009', 'Nail Clippers - Standard', 'tools', 'TL-004', 5, 'each', 2, 4, 6.50, 14.99, 'Professional Grooming Tools', true),
    ('650e8400-e29b-41d4-a716-446655440010', 'Nail Grinder', 'tools', 'TL-005', 3, 'each', 1, 2, 35.00, NULL, 'Professional Grooming Tools', true),
    ('650e8400-e29b-41d4-a716-446655440011', 'Grooming Table Arm', 'tools', 'TL-006', 2, 'each', 1, 2, 45.00, NULL, 'Professional Grooming Tools', true),
    ('650e8400-e29b-41d4-a716-446655440012', 'Dog Bandanas - Assorted', 'accessories', 'AC-001', 50, 'each', 15, 30, 2.00, 8.99, 'Pet Fashion Wholesale', true),
    ('650e8400-e29b-41d4-a716-446655440013', 'Bow Ties - Assorted', 'accessories', 'AC-002', 35, 'each', 10, 25, 3.00, 9.99, 'Pet Fashion Wholesale', true),
    ('650e8400-e29b-41d4-a716-446655440014', 'Grooming Aprons', 'accessories', 'AC-003', 8, 'each', 2, 5, 15.00, NULL, 'Professional Grooming Tools', true),
    ('650e8400-e29b-41d4-a716-446655440015', 'Peanut Butter Treats', 'treats', 'TR-001', 40, 'bag', 10, 20, 3.50, 8.99, 'Pet Treats Direct', true),
    ('650e8400-e29b-41d4-a716-446655440016', 'Dental Chews', 'treats', 'TR-002', 30, 'bag', 10, 20, 4.00, 9.99, 'Pet Treats Direct', true);

-- ============================================================================
-- NOTE: The following data requires actual auth.users UUIDs
-- After setting up authentication and creating test users, update these
-- placeholder UUIDs with real ones from auth.users table
-- ============================================================================

-- Example: Insert test profiles (replace UUIDs with actual auth.users IDs)
-- INSERT INTO public.profiles (id, email, first_name, last_name, phone, role) VALUES
--     ('00000000-0000-0000-0000-000000000001', 'admin@scruffybutts.com', 'Admin', 'User', '555-0100', 'admin'),
--     ('00000000-0000-0000-0000-000000000002', 'sarah@scruffybutts.com', 'Sarah', 'Johnson', '555-0101', 'staff'),
--     ('00000000-0000-0000-0000-000000000003', 'mike@scruffybutts.com', 'Mike', 'Chen', '555-0102', 'staff'),
--     ('00000000-0000-0000-0000-000000000004', 'customer@example.com', 'Jane', 'Doe', '555-0200', 'customer');

-- Example: Insert staff members (update user_id to match profiles)
-- INSERT INTO public.staff_members (id, user_id, first_name, last_name, email, phone, position, hire_date, status, rating, color) VALUES
--     ('750e8400-e29b-41d4-a716-446655440001', '00000000-0000-0000-0000-000000000002', 'Sarah', 'Johnson', 'sarah@scruffybutts.com', '555-0101', 'Senior Groomer', '2023-01-15', 'active', 4.9, '#3B82F6'),
--     ('750e8400-e29b-41d4-a716-446655440002', '00000000-0000-0000-0000-000000000003', 'Mike', 'Chen', 'mike@scruffybutts.com', '555-0102', 'Junior Groomer', '2023-06-01', 'active', 4.7, '#10B981');

-- Example: Insert customers (update user_id if customers have auth accounts)
-- INSERT INTO public.customers (id, first_name, last_name, email, phone, address, city, state, zip) VALUES
--     ('850e8400-e29b-41d4-a716-446655440001', 'Emily', 'Rodriguez', 'emily.r@example.com', '555-1001', '123 Maple Street', 'Portland', 'OR', '97201'),
--     ('850e8400-e29b-41d4-a716-446655440002', 'David', 'Thompson', 'david.t@example.com', '555-1002', '456 Oak Avenue', 'Portland', 'OR', '97202'),
--     ('850e8400-e29b-41d4-a716-446655440003', 'Lisa', 'Martinez', 'lisa.m@example.com', '555-1003', '789 Pine Road', 'Portland', 'OR', '97203');

-- Example: Insert pets (requires customer IDs)
-- INSERT INTO public.pets (id, customer_id, name, breed, size, notes) VALUES
--     ('950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 'Max', 'Golden Retriever', 'large', 'Very friendly, loves treats'),
--     ('950e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440001', 'Bella', 'Poodle', 'small', 'Needs gentle handling, sensitive ears'),
--     ('950e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440002', 'Charlie', 'Labrador Mix', 'medium', 'Energetic, good with loud noises'),
--     ('950e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440003', 'Luna', 'Shih Tzu', 'small', 'Requires frequent grooming, matting issues');

-- ============================================================================
-- DEVELOPMENT NOTES
-- ============================================================================
-- 1. After running this seed:
--    - Create auth users via Supabase Dashboard or Auth API
--    - Update the commented-out INSERT statements with real UUIDs
--    - Run the profile/staff/customer/pet inserts
--
-- 2. To reset seed data:
--    DELETE FROM public.inventory_items;
--    DELETE FROM public.services;
--    Then re-run this file
--
-- 3. For production:
--    - Do NOT use this seed file
--    - Create a separate production seed with only essential catalog data
--    - Never seed customer/pet/appointment data in production
