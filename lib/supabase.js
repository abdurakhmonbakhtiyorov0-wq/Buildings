import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;

// Публичный ключ anon: читать каталог и добавлять заявки разрешают правила RLS в базе.
export const supabase =
  url && anonKey
    ? createClient(url, anonKey, { auth: { persistSession: false } })
    : null;
