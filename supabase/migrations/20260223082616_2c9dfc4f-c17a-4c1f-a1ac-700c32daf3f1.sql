
-- Entity memory table for remembering business entities per project
CREATE TABLE public.user_entity_memory (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  intent text NOT NULL,
  business_name text,
  sections text[],
  color_scheme text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(project_id)
);

-- Enable RLS
ALTER TABLE public.user_entity_memory ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can manage entity memory for their own projects
CREATE POLICY "Users can view entity memory for their projects"
ON public.user_entity_memory
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM projects WHERE projects.id = user_entity_memory.project_id AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can insert entity memory for their projects"
ON public.user_entity_memory
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM projects WHERE projects.id = user_entity_memory.project_id AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can update entity memory for their projects"
ON public.user_entity_memory
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM projects WHERE projects.id = user_entity_memory.project_id AND projects.user_id = auth.uid()
));

-- Allow edge function (service role) to read/write without auth
CREATE POLICY "Service role can manage entity memory"
ON public.user_entity_memory
FOR ALL
USING (true)
WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_user_entity_memory_updated_at
BEFORE UPDATE ON public.user_entity_memory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
