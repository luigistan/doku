
-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create db_connections table
CREATE TABLE public.db_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('mysql', 'postgres', 'mssql')),
  host TEXT NOT NULL,
  port INTEGER NOT NULL,
  database_name TEXT NOT NULL,
  username TEXT NOT NULL,
  password_encrypted TEXT NOT NULL,
  use_ssl BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ok', 'fail')),
  status_message TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.db_connections ENABLE ROW LEVEL SECURITY;

-- RLS: only project owner can manage connections
CREATE POLICY "Users can view their project connections"
ON public.db_connections FOR SELECT
USING (EXISTS (
  SELECT 1 FROM projects WHERE projects.id = db_connections.project_id AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can create connections for their projects"
ON public.db_connections FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM projects WHERE projects.id = db_connections.project_id AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can update their project connections"
ON public.db_connections FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM projects WHERE projects.id = db_connections.project_id AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete their project connections"
ON public.db_connections FOR DELETE
USING (EXISTS (
  SELECT 1 FROM projects WHERE projects.id = db_connections.project_id AND projects.user_id = auth.uid()
));

-- Trigger for updated_at
CREATE TRIGGER update_db_connections_updated_at
BEFORE UPDATE ON public.db_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
