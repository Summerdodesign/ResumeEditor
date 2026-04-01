import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 数据库表类型定义
export interface DbResumeVersion {
  id: string;
  name: string;
  data: string; // JSON string
  updated_at: string;
  created_at: string;
  session_id: string;
}

export interface DbProjectLibrary {
  id: string;
  title: string;
  role: string;
  period: string;
  background: string;
  task: string;
  actions: string; // JSON string
  results: string; // JSON string
  keywords: string; // JSON string (array of strings)
  scenarios: string; // JSON string (array of {name, actions, results})
  updated_at: string;
  created_at: string;
  session_id: string;
}
