
CREATE TABLE public.diet_plan_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.diet_plans(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(plan_id, member_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.diet_plan_members TO authenticated;
GRANT ALL ON public.diet_plan_members TO service_role;

ALTER TABLE public.diet_plan_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can manage diet plan members"
  ON public.diet_plan_members FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE INDEX idx_diet_plan_members_plan ON public.diet_plan_members(plan_id);
CREATE INDEX idx_diet_plan_members_member ON public.diet_plan_members(member_id);

-- Backfill from existing single-member assignment
INSERT INTO public.diet_plan_members (plan_id, member_id)
SELECT id, member_id FROM public.diet_plans
WHERE member_id IS NOT NULL
ON CONFLICT DO NOTHING;
