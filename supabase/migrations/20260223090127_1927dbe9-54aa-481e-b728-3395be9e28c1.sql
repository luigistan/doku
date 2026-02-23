
-- Add db_enabled to projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS db_enabled boolean NOT NULL DEFAULT false;

-- Create app_tables
CREATE TABLE public.app_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.app_tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their project tables"
  ON public.app_tables FOR ALL
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = app_tables.project_id AND projects.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = app_tables.project_id AND projects.user_id = auth.uid()));

-- Create app_columns
CREATE TABLE public.app_columns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id uuid NOT NULL REFERENCES public.app_tables(id) ON DELETE CASCADE,
  name text NOT NULL,
  column_type text NOT NULL DEFAULT 'text',
  is_required boolean NOT NULL DEFAULT false,
  default_value text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.app_columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage columns of their project tables"
  ON public.app_columns FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.app_tables
    JOIN public.projects ON projects.id = app_tables.project_id
    WHERE app_tables.id = app_columns.table_id AND projects.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.app_tables
    JOIN public.projects ON projects.id = app_tables.project_id
    WHERE app_tables.id = app_columns.table_id AND projects.user_id = auth.uid()
  ));

-- Create app_rows
CREATE TABLE public.app_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id uuid NOT NULL REFERENCES public.app_tables(id) ON DELETE CASCADE,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.app_rows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage rows of their project tables"
  ON public.app_rows FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.app_tables
    JOIN public.projects ON projects.id = app_tables.project_id
    WHERE app_tables.id = app_rows.table_id AND projects.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.app_tables
    JOIN public.projects ON projects.id = app_tables.project_id
    WHERE app_tables.id = app_rows.table_id AND projects.user_id = auth.uid()
  ));

-- Trigger for app_rows updated_at
CREATE TRIGGER update_app_rows_updated_at
  BEFORE UPDATE ON public.app_rows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
