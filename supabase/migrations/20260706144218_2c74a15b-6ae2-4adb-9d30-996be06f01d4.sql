
-- =========================================================
-- ROLES / RBAC
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('super_admin','owner','manager','trainer','receptionist','accountant');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  branch_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated read roles" ON public.user_roles FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- Auto-assign first ever user as owner
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'owner');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'receptionist')
      ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Shared updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- =========================================================
-- BRANCHES
-- =========================================================
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.branches TO authenticated;
GRANT ALL ON public.branches TO service_role;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all branches" ON public.branches FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_branches_updated BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- MEMBERS
-- =========================================================
CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_code TEXT UNIQUE,
  full_name TEXT NOT NULL,
  mobile TEXT,
  email TEXT,
  address TEXT,
  dob DATE,
  gender TEXT,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  blood_group TEXT,
  medical_conditions TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  photo_url TEXT,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',
  joined_on DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.members TO authenticated;
GRANT ALL ON public.members TO service_role;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all members" ON public.members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_members_updated BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX ON public.members (branch_id);
CREATE INDEX ON public.members (status);

-- =========================================================
-- MEMBERSHIP PLANS + MEMBERSHIPS
-- =========================================================
CREATE TABLE public.membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  gst_percent NUMERIC(5,2) NOT NULL DEFAULT 18,
  freeze_days INTEGER NOT NULL DEFAULT 0,
  personal_training BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.membership_plans TO authenticated;
GRANT ALL ON public.membership_plans TO service_role;
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all plans" ON public.membership_plans FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_plans_updated BEFORE UPDATE ON public.membership_plans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.membership_plans(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memberships TO authenticated;
GRANT ALL ON public.memberships TO service_role;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all memberships" ON public.memberships FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_memberships_updated BEFORE UPDATE ON public.memberships FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX ON public.memberships (member_id);
CREATE INDEX ON public.memberships (end_date);

-- =========================================================
-- ATTENDANCE
-- =========================================================
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  check_in TIMESTAMPTZ NOT NULL DEFAULT now(),
  check_out TIMESTAMPTZ,
  method TEXT NOT NULL DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
GRANT ALL ON public.attendance TO service_role;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all attendance" ON public.attendance FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX ON public.attendance (member_id, check_in);

-- =========================================================
-- TRAINERS
-- =========================================================
CREATE TABLE public.trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  mobile TEXT,
  email TEXT,
  experience_years INTEGER DEFAULT 0,
  specialization TEXT,
  salary NUMERIC(10,2) DEFAULT 0,
  working_hours TEXT,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  photo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trainers TO authenticated;
GRANT ALL ON public.trainers TO service_role;
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all trainers" ON public.trainers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_trainers_updated BEFORE UPDATE ON public.trainers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trainer <-> member assignments
CREATE TABLE public.trainer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES public.trainers(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (trainer_id, member_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trainer_assignments TO authenticated;
GRANT ALL ON public.trainer_assignments TO service_role;
ALTER TABLE public.trainer_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all assignments" ON public.trainer_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =========================================================
-- WORKOUT PLANS
-- =========================================================
CREATE TABLE public.workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  trainer_id UUID REFERENCES public.trainers(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_plans TO authenticated;
GRANT ALL ON public.workout_plans TO service_role;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all workout_plans" ON public.workout_plans FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_wp_updated BEFORE UPDATE ON public.workout_plans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.workout_plans(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  sets INTEGER DEFAULT 3,
  reps INTEGER DEFAULT 10,
  rest_seconds INTEGER DEFAULT 60,
  notes TEXT,
  sort_order INTEGER DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_exercises TO authenticated;
GRANT ALL ON public.workout_exercises TO service_role;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all workout_exercises" ON public.workout_exercises FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =========================================================
-- DIET PLANS
-- =========================================================
CREATE TABLE public.diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  breakfast TEXT,
  lunch TEXT,
  snacks TEXT,
  dinner TEXT,
  calories INTEGER,
  protein_g INTEGER,
  water_liters NUMERIC(4,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diet_plans TO authenticated;
GRANT ALL ON public.diet_plans TO service_role;
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all diet_plans" ON public.diet_plans FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_dp_updated BEFORE UPDATE ON public.diet_plans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- PAYMENTS / INVOICES
-- =========================================================
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_no TEXT UNIQUE,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  membership_id UUID REFERENCES public.memberships(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  gst_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  due_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  method TEXT NOT NULL DEFAULT 'cash',
  status TEXT NOT NULL DEFAULT 'paid',
  paid_on DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all payments" ON public.payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_pay_updated BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX ON public.payments (paid_on);

-- =========================================================
-- EXPENSES
-- =========================================================
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  spent_on DATE NOT NULL DEFAULT CURRENT_DATE,
  vendor TEXT,
  notes TEXT,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT ALL ON public.expenses TO service_role;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all expenses" ON public.expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_exp_updated BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- EQUIPMENT
-- =========================================================
CREATE TABLE public.equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  purchase_date DATE,
  warranty_until DATE,
  last_service_date DATE,
  condition TEXT DEFAULT 'good',
  vendor TEXT,
  cost NUMERIC(10,2),
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipment TO authenticated;
GRANT ALL ON public.equipment TO service_role;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all equipment" ON public.equipment FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_eq_updated BEFORE UPDATE ON public.equipment FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- STAFF
-- =========================================================
CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  mobile TEXT,
  email TEXT,
  salary NUMERIC(10,2) DEFAULT 0,
  joined_on DATE DEFAULT CURRENT_DATE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff TO authenticated;
GRANT ALL ON public.staff TO service_role;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all staff" ON public.staff FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_staff_updated BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- INVENTORY / SALES
-- =========================================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  sku TEXT,
  cost_price NUMERIC(10,2) DEFAULT 0,
  sell_price NUMERIC(10,2) DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all products" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_prod_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.product_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  sold_on DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_sales TO authenticated;
GRANT ALL ON public.product_sales TO service_role;
ALTER TABLE public.product_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all product_sales" ON public.product_sales FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =========================================================
-- LEADS / CRM
-- =========================================================
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  mobile TEXT,
  email TEXT,
  source TEXT NOT NULL DEFAULT 'walk_in',
  status TEXT NOT NULL DEFAULT 'new',
  interest TEXT,
  notes TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all leads" ON public.leads FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_leads_updated BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  followup_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  channel TEXT DEFAULT 'call',
  outcome TEXT,
  notes TEXT,
  done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.followups TO authenticated;
GRANT ALL ON public.followups TO service_role;
ALTER TABLE public.followups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all followups" ON public.followups FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =========================================================
-- NOTIFICATIONS
-- =========================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL DEFAULT 'email',
  recipient TEXT NOT NULL,
  subject TEXT,
  body TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all notifications" ON public.notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =========================================================
-- SETTINGS (single row)
-- =========================================================
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL DEFAULT 'My Gym',
  currency TEXT NOT NULL DEFAULT 'INR',
  currency_symbol TEXT NOT NULL DEFAULT '₹',
  gst_percent NUMERIC(5,2) NOT NULL DEFAULT 18,
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  theme TEXT NOT NULL DEFAULT 'light',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all settings" ON public.settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.settings (business_name) VALUES ('My Gym');
INSERT INTO public.branches (name, address) VALUES ('Main Branch', 'Head office');
INSERT INTO public.membership_plans (name, duration_days, price, gst_percent, description) VALUES
  ('Monthly', 30, 1500, 18, '1 month access'),
  ('Quarterly', 90, 4000, 18, '3 months access'),
  ('Half-Yearly', 180, 7500, 18, '6 months access'),
  ('Yearly', 365, 12000, 18, '12 months access');
