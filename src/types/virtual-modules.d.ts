// src/types/virtual-modules.d.ts

declare module '@/db/supabase' {
  export const supabase: ReturnType<typeof import('@supabase/supabase-js').createClient>;
}

declare module '@/types/types' {
  export interface Profile {
    [key: string]: unknown;
  }
}
