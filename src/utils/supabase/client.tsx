import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, publicAnonKey);

export type User = {
  id: string;
  email: string;
  name?: string;
  role?: 'user' | 'admin';
};

export type AuthError = {
  message: string;
};