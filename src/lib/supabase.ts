import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface TournamentConfig {
  id: string;
  nombre_torneo: string;
  organizacion: string;
  fvf_autorizado: boolean;
  fecha_inicio: string;
  fecha_fin: string;
  equipos_a: string[];
  equipos_b: string[];
  equipos_c: string[];
  initialized: boolean;
  created_at: string;
}

export interface Match {
  id: string;
  match_id: string;
  grupo: 'A' | 'B' | 'C';
  jornada: number;
  numero: number;
  equipo_local: string;
  equipo_visitante: string;
  cancha: string;
  fecha: string;
  hora: string;
  score_local: number | null;
  score_visitante: number | null;
  played: boolean;
  incomparecencia: boolean;
  updated_at: string;
  updated_by: string | null;
}

export interface Standing {
  id: string;
  grupo: 'A' | 'B' | 'C';
  equipo: string;
  posicion: number;
  pj: number;
  g: number;
  e: number;
  p: number;
  gf: number;
  gc: number;
  dif: number;
  pts: number;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  accion: string;
  tabla: string;
  registro_id: string;
  cambios: any;
  usuario_id: string | null;
  timestamp: string;
  ip_address: string | null;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user' | 'viewer';
  created_at: string;
}
