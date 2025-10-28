-- Advanced Database Functions and Realtime Configuration
-- This migration adds RPC functions for complex queries and enables realtime

-- ============================================================================
-- RPC FUNCTIONS FOR APPOINTMENTS
-- ============================================================================

-- Get appointments with full details (customer, pet, service, staff)
CREATE OR REPLACE FUNCTION public.get_appointment_details(p_appointment_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'appointment', row_to_json(a.*),
    'customer', json_build_object(
      'id', c.id,
      'firstName', c.first_name,
      'lastName', c.last_name,
      'email', c.email,
      'phone', c.phone
    ),
    'pet', json_build_object(
      'id', p.id,
      'name', p.name,
      'breed', p.breed,
      'size', p.size
    ),
    'service', json_build_object(
      'id', s.id,
      'name', s.name,
      'duration', s.duration,
      'price', s.price
    ),
    'staff', CASE
      WHEN sm.id IS NOT NULL THEN json_build_object(
        'id', sm.id,
        'firstName', sm.first_name,
        'lastName', sm.last_name,
        'color', sm.color
      )
      ELSE NULL
    END
  ) INTO result
  FROM public.appointments a
  JOIN public.customers c ON a.customer_id = c.id
  JOIN public.pets p ON a.pet_id = p.id
  JOIN public.services s ON a.service_id = s.id
  LEFT JOIN public.staff_members sm ON a.staff_id = sm.id
  WHERE a.id = p_appointment_id
  AND (
    -- Customer can see their own appointments
    c.user_id = auth.uid() OR
    -- Staff can see all appointments
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );
  
  IF result IS NULL THEN
    RAISE EXCEPTION 'Appointment not found or access denied';
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_appointment_details TO authenticated;

-- Get appointments for a date range
CREATE OR REPLACE FUNCTION public.get_appointments_by_date_range(
  p_start_date DATE,
  p_end_date DATE,
  p_staff_id UUID DEFAULT NULL,
  p_status TEXT DEFAULT NULL
)
RETURNS TABLE (
  appointment_id UUID,
  customer_name TEXT,
  pet_name TEXT,
  service_name TEXT,
  staff_name TEXT,
  appointment_date DATE,
  start_time TIME,
  end_time TIME,
  status TEXT,
  price DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    c.first_name || ' ' || c.last_name,
    p.name,
    s.name,
    CASE
      WHEN sm.id IS NOT NULL THEN sm.first_name || ' ' || sm.last_name
      ELSE NULL
    END,
    a.appointment_date,
    a.start_time,
    a.end_time,
    a.status,
    a.price
  FROM public.appointments a
  JOIN public.customers c ON a.customer_id = c.id
  JOIN public.pets p ON a.pet_id = p.id
  JOIN public.services s ON a.service_id = s.id
  LEFT JOIN public.staff_members sm ON a.staff_id = sm.id
  WHERE a.appointment_date BETWEEN p_start_date AND p_end_date
    AND (p_staff_id IS NULL OR a.staff_id = p_staff_id)
    AND (p_status IS NULL OR a.status = p_status)
    AND (
      -- Customer can see their own appointments
      c.user_id = auth.uid() OR
      -- Staff can see all appointments
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('staff', 'admin')
      )
    )
  ORDER BY a.appointment_date, a.start_time;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_appointments_by_date_range TO authenticated;

-- Check for appointment conflicts and return conflicting appointments
CREATE OR REPLACE FUNCTION public.find_appointment_conflicts(
  p_staff_id UUID,
  p_appointment_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_exclude_appointment_id UUID DEFAULT NULL
)
RETURNS TABLE (
  appointment_id UUID,
  customer_name TEXT,
  pet_name TEXT,
  start_time TIME,
  end_time TIME
) AS $$
BEGIN
  IF p_staff_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    a.id,
    c.first_name || ' ' || c.last_name,
    p.name,
    a.start_time,
    a.end_time
  FROM public.appointments a
  JOIN public.customers c ON a.customer_id = c.id
  JOIN public.pets p ON a.pet_id = p.id
  WHERE a.staff_id = p_staff_id
    AND a.appointment_date = p_appointment_date
    AND a.status NOT IN ('cancelled', 'no-show', 'completed')
    AND (p_exclude_appointment_id IS NULL OR a.id != p_exclude_appointment_id)
    AND (
      (a.start_time <= p_start_time AND a.end_time > p_start_time) OR
      (a.start_time < p_end_time AND a.end_time >= p_end_time) OR
      (a.start_time >= p_start_time AND a.end_time <= p_end_time)
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.find_appointment_conflicts TO authenticated;

-- ============================================================================
-- RPC FUNCTIONS FOR REPORTING & ANALYTICS
-- ============================================================================

-- Get revenue summary for a date range
CREATE OR REPLACE FUNCTION public.get_revenue_summary(
  p_start_date DATE,
  p_end_date DATE
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Only staff and admins can access reports
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('staff', 'admin')
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT json_build_object(
    'totalRevenue', COALESCE(SUM(total), 0),
    'totalTransactions', COUNT(*),
    'averageTransaction', COALESCE(AVG(total), 0),
    'totalTax', COALESCE(SUM(tax), 0),
    'totalTips', COALESCE(SUM(tip), 0),
    'totalDiscounts', COALESCE(SUM(discount), 0),
    'byPaymentMethod', (
      SELECT json_object_agg(payment_method, revenue)
      FROM (
        SELECT
          payment_method,
          SUM(total) as revenue
        FROM public.transactions
        WHERE transaction_date BETWEEN p_start_date AND p_end_date
        GROUP BY payment_method
      ) pm
    )
  ) INTO result
  FROM public.transactions
  WHERE transaction_date BETWEEN p_start_date AND p_end_date;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_revenue_summary TO authenticated;

-- Get staff performance metrics
CREATE OR REPLACE FUNCTION public.get_staff_performance(
  p_staff_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Only staff can view their own performance, admins can view all
  IF NOT EXISTS (
    SELECT 1 FROM public.staff_members sm
    JOIN public.profiles p ON sm.user_id = p.id
    WHERE sm.id = p_staff_id
    AND (
      p.id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT json_build_object(
    'staffId', p_staff_id,
    'appointmentsCompleted', (
      SELECT COUNT(*)
      FROM public.appointments
      WHERE staff_id = p_staff_id
      AND appointment_date BETWEEN p_start_date AND p_end_date
      AND status = 'completed'
    ),
    'totalRevenue', (
      SELECT COALESCE(SUM(t.total), 0)
      FROM public.transactions t
      WHERE t.staff_id = p_staff_id
      AND t.transaction_date BETWEEN p_start_date AND p_end_date
    ),
    'averageServiceTime', (
      SELECT COALESCE(AVG(duration), 0)
      FROM public.appointments
      WHERE staff_id = p_staff_id
      AND appointment_date BETWEEN p_start_date AND p_end_date
      AND status = 'completed'
    ),
    'noShowRate', (
      SELECT ROUND(
        CASE
          WHEN COUNT(*) > 0 THEN
            COUNT(*) FILTER (WHERE status = 'no-show')::DECIMAL / COUNT(*) * 100
          ELSE 0
        END, 2
      )
      FROM public.appointments
      WHERE staff_id = p_staff_id
      AND appointment_date BETWEEN p_start_date AND p_end_date
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_staff_performance TO authenticated;

-- Get inventory low stock items
CREATE OR REPLACE FUNCTION public.get_low_stock_items()
RETURNS TABLE (
  item_id UUID,
  item_name TEXT,
  category TEXT,
  current_quantity INTEGER,
  reorder_level INTEGER,
  reorder_quantity INTEGER,
  supplier TEXT
) AS $$
BEGIN
  -- Only staff and admins can view inventory
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('staff', 'admin')
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    i.id,
    i.name,
    i.category,
    i.quantity,
    i.reorder_level,
    i.reorder_quantity,
    i.supplier
  FROM public.inventory_items i
  WHERE i.quantity <= i.reorder_level
    AND i.active = true
  ORDER BY
    CASE
      WHEN i.quantity = 0 THEN 1
      WHEN i.quantity < i.reorder_level THEN 2
      ELSE 3
    END,
    i.name;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_low_stock_items TO authenticated;

-- ============================================================================
-- RPC FUNCTIONS FOR CUSTOMER INSIGHTS
-- ============================================================================

-- Get customer appointment history
CREATE OR REPLACE FUNCTION public.get_customer_history(p_customer_id UUID)
RETURNS TABLE (
  appointment_id UUID,
  pet_name TEXT,
  service_name TEXT,
  appointment_date DATE,
  status TEXT,
  price DECIMAL,
  staff_name TEXT
) AS $$
BEGIN
  -- Verify access
  IF NOT EXISTS (
    SELECT 1 FROM public.customers c
    WHERE c.id = p_customer_id
    AND (
      c.user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('staff', 'admin')
      )
    )
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    a.id,
    p.name,
    s.name,
    a.appointment_date,
    a.status,
    a.price,
    CASE
      WHEN sm.id IS NOT NULL THEN sm.first_name || ' ' || sm.last_name
      ELSE NULL
    END
  FROM public.appointments a
  JOIN public.pets p ON a.pet_id = p.id
  JOIN public.services s ON a.service_id = s.id
  LEFT JOIN public.staff_members sm ON a.staff_id = sm.id
  WHERE a.customer_id = p_customer_id
  ORDER BY a.appointment_date DESC, a.start_time DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_customer_history TO authenticated;

-- ============================================================================
-- REALTIME PUBLICATION
-- ============================================================================

-- Enable realtime for appointments table
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;

-- Enable realtime for transactions table
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;

-- Enable realtime for inventory_items table (for low-stock alerts)
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_items;

COMMENT ON FUNCTION public.get_appointment_details IS 'Returns full appointment details with customer, pet, service, and staff';
COMMENT ON FUNCTION public.get_appointments_by_date_range IS 'Returns appointments for a date range with optional filters';
COMMENT ON FUNCTION public.find_appointment_conflicts IS 'Finds conflicting appointments for a staff member and time slot';
COMMENT ON FUNCTION public.get_revenue_summary IS 'Returns revenue metrics for a date range (staff/admin only)';
COMMENT ON FUNCTION public.get_staff_performance IS 'Returns performance metrics for a staff member';
COMMENT ON FUNCTION public.get_low_stock_items IS 'Returns inventory items that need reordering';
COMMENT ON FUNCTION public.get_customer_history IS 'Returns appointment history for a customer';
