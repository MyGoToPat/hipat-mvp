/*  Hand‑rolled minimal Supabase types
    ------------------------------------------------------------------
    Delete this file once you can run `supabase gen types`
-------------------------------------------------------------------- */

export type Json =
  | string | number | boolean
  | { [key: string]: Json | undefined }
  | Json[];

export namespace Database {
  export namespace public {
    export namespace Tables {
      export interface agents {
        id?: string;
        name: string;
        role: string;
        category?: string | null;
        description: string;
        prompt?: string | null;
        assistant_id?: string | null;
        tools_json?: Json;
        token_budget?: number | null;
        memory_flags?: Json;
        default_api_model?: string | null;
        linked_api_models?: string[] | null;
        input_types?: string[] | null;
        free_access?: boolean | null;
        premium_access?: boolean | null;
        status?: string | null;
        knowledge_base?: string[] | null;
        context_window?: string | null;
        priority?: string | null;
        trigger_keywords?: string[] | null;
        version?: string | null;
        created_at?: string;
        created_by?: string | null;
        swarm_group?: string | null;
      }
      /* add more table interfaces here if needed */
    }
  }
}