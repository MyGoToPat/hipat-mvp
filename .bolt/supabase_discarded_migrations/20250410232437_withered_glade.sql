-- Drop the current RLS policy if it exists
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.agents;

-- Create a new full-access authenticated policy
CREATE POLICY "Authenticated users can read and write" ON public.agents
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Explicitly confirm execution
SELECT * FROM public.agents LIMIT 1;