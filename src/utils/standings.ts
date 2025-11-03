import type { Match, Standing } from '../lib/supabase';

export function calculateStandings(matches: Match[], equipos: string[], grupo: 'A' | 'B' | 'C'): Standing[] {
  const standings: Standing[] = [];

  equipos.forEach(equipo => {
    let pj = 0, g = 0, e = 0, p = 0, gf = 0, gc = 0;

    matches.forEach(match => {
      if (!match.played || match.incomparecencia || match.grupo !== grupo) return;
      if (match.equipo_visitante === 'DESCANSO' || match.equipo_local === 'DESCANSO') return;
      if (match.score_local === null || match.score_visitante === null) return;

      if (match.equipo_local === equipo) {
        pj++;
        gf += match.score_local;
        gc += match.score_visitante;
        if (match.score_local > match.score_visitante) g++;
        else if (match.score_local === match.score_visitante) e++;
        else p++;
      } else if (match.equipo_visitante === equipo) {
        pj++;
        gf += match.score_visitante;
        gc += match.score_local;
        if (match.score_visitante > match.score_local) g++;
        else if (match.score_local === match.score_visitante) e++;
        else p++;
      }
    });

    const dif = gf - gc;
    const pts = g * 3 + e * 1;

    standings.push({
      id: '',
      grupo,
      equipo,
      posicion: 0,
      pj,
      g,
      e,
      p,
      gf,
      gc,
      dif,
      pts,
      updated_at: new Date().toISOString()
    });
  });

  standings.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dif !== a.dif) return b.dif - a.dif;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.equipo.localeCompare(b.equipo);
  });

  standings.forEach((standing, index) => {
    standing.posicion = index + 1;
  });

  return standings;
}

export function validateScore(value: string): { valid: boolean; error?: string } {
  if (value === '') {
    return { valid: false, error: 'El score no puede estar vacío' };
  }

  const num = parseInt(value, 10);

  if (isNaN(num)) {
    return { valid: false, error: 'Solo se permiten números' };
  }

  if (num < 0) {
    return { valid: false, error: 'Los scores no pueden ser negativos' };
  }

  if (num > 99) {
    return { valid: false, error: 'Los scores máximo pueden ser 99' };
  }

  return { valid: true };
}
