-- Friendly lookup data for operational forms
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated read user profiles"
  ON public.user_profiles FOR SELECT TO authenticated USING (true);

INSERT INTO public.user_profiles (id, display_name, email)
SELECT
  id,
  COALESCE(NULLIF(raw_user_meta_data ->> 'full_name', ''), NULLIF(raw_user_meta_data ->> 'name', ''), email),
  email
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET display_name = EXCLUDED.display_name, email = EXCLUDED.email;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''), NULLIF(NEW.raw_user_meta_data ->> 'name', ''), NEW.email),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE
  SET display_name = EXCLUDED.display_name, email = EXCLUDED.email;

  IF NOT EXISTS (SELECT 1 FROM public.user_roles) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'owner');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'receptionist')
      ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE VIEW public.membership_options
WITH (security_invoker = true) AS
SELECT
  membership.id,
  membership.member_id,
  membership.plan_id,
  CONCAT(member.full_name, ' - ', plan.name, ' (', membership.start_date, ' to ', membership.end_date, ')') AS label
FROM public.memberships AS membership
JOIN public.members AS member ON member.id = membership.member_id
JOIN public.membership_plans AS plan ON plan.id = membership.plan_id;

GRANT SELECT ON public.membership_options TO authenticated;