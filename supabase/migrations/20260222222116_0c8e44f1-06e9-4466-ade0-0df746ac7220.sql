
-- Table for machine learning / auto-learning patterns
CREATE TABLE public.ai_learning_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_message TEXT NOT NULL,
  detected_intent TEXT NOT NULL,
  detected_entities JSONB,
  confidence FLOAT,
  user_accepted BOOLEAN DEFAULT NULL,
  user_feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.ai_learning_logs ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can insert (for logging)
CREATE POLICY "Anyone can insert learning logs"
ON public.ai_learning_logs
FOR INSERT
WITH CHECK (true);

-- Anyone can read (edge function needs to query patterns)
CREATE POLICY "Anyone can read learning logs"
ON public.ai_learning_logs
FOR SELECT
USING (true);

-- Allow updates for feedback (user_accepted, user_feedback)
CREATE POLICY "Anyone can update learning logs"
ON public.ai_learning_logs
FOR UPDATE
USING (true);
