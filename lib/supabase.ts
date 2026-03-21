import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface ChecklistItem {
  id: string;
  repo_id: string;
  item_key: string;
  completed: boolean;
  user_id: string;
}
