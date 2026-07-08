
CREATE TABLE public.diet_meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.diet_plans(id) ON DELETE CASCADE,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  meal_time time NOT NULL,
  meal_name text NOT NULL,
  description text,
  notify boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diet_meals TO authenticated;
GRANT ALL ON public.diet_meals TO service_role;
ALTER TABLE public.diet_meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all diet_meals" ON public.diet_meals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_diet_meals_updated BEFORE UPDATE ON public.diet_meals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX diet_meals_plan_idx ON public.diet_meals(plan_id);
CREATE INDEX diet_meals_dow_time_idx ON public.diet_meals(day_of_week, meal_time);

CREATE TABLE public.diet_meal_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id uuid NOT NULL REFERENCES public.diet_meals(id) ON DELETE CASCADE,
  member_id uuid REFERENCES public.members(id) ON DELETE CASCADE,
  sent_date date NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(meal_id, member_id, sent_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diet_meal_sends TO authenticated;
GRANT ALL ON public.diet_meal_sends TO service_role;
ALTER TABLE public.diet_meal_sends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all diet_meal_sends" ON public.diet_meal_sends FOR ALL TO authenticated USING (true) WITH CHECK (true);
