ALTER TABLE public.projects ADD COLUMN slug TEXT UNIQUE;
CREATE INDEX idx_projects_slug ON public.projects(slug);