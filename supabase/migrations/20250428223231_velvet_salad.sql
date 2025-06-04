/*
  # Add swarm_group column to agents table

  1. Schema Changes
    - Add `swarm_group` column of type TEXT to `agents` table
    - This allows grouping agents into swarms for coordinated operation

  2. Changes
    - Agents can now be tagged with a swarm group identifier
    - Enables organization of agents into functional groups
*/

ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS swarm_group text;