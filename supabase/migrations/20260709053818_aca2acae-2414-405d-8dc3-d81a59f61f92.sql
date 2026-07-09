CREATE TABLE public.membership_expiry_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id uuid NOT NULL,
  member_id uuid,
  days_before int NOT NULL,
  sent_date date NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(membership_id, days_before, sent_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.membership_expiry_sends TO authenticated;
GRANT ALL ON public.membership_expiry_sends TO service_role;
ALTER TABLE public.membership_expiry_sends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read expiry sends" ON public.membership_expiry_sends FOR SELECT TO authenticated USING (true);