import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Match } from '../lib/supabase';
import { MatchCard } from './MatchCard';
import { calculateStandings } from '../utils/standings';

interface JornadaTabProps {
  grupo: 'A' | 'B' | 'C';
  canEdit: boolean;
  equipos: string[];
}

export function JornadaTab({ grupo, canEdit, equipos }: JornadaTabProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();

    const channel = supabase
      .channel('matches-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => {
        fetchMatches();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [grupo]);

  const fetchMatches = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('grupo', grupo)
      .order('jornada', { ascending: true })
      .order('numero', { ascending: true });

    if (error) {
      console.error('Error fetching matches:', error);
    } else {
      setMatches(data || []);
    }
    setLoading(false);
  };

  const handleSaveMatch = async (matchId: string, scoreLocal: number, scoreVisitante: number) => {
    const { data: { user } } = await supabase.auth.getUser();

    const { error: updateError } = await supabase
      .from('matches')
      .update({
        score_local: scoreLocal,
        score_visitante: scoreVisitante,
        played: true,
        updated_at: new Date().toISOString(),
        updated_by: user?.id || null,
      })
      .eq('id', matchId);

    if (updateError) {
      throw updateError;
    }

    const { data: allMatches } = await supabase
      .from('matches')
      .select('*')
      .eq('grupo', grupo);

    if (allMatches) {
      const standings = calculateStandings(allMatches, equipos, grupo);

      for (const standing of standings) {
        await supabase
          .from('standings')
          .upsert({
            grupo: standing.grupo,
            equipo: standing.equipo,
            posicion: standing.posicion,
            pj: standing.pj,
            g: standing.g,
            e: standing.e,
            p: standing.p,
            gf: standing.gf,
            gc: standing.gc,
            dif: standing.dif,
            pts: standing.pts,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'grupo,equipo'
          });
      }
    }

    await supabase
      .from('audit_log')
      .insert({
        accion: 'UPDATE_MATCH',
        tabla: 'matches',
        registro_id: matchId,
        cambios: {
          score_local: scoreLocal,
          score_visitante: scoreVisitante,
        },
        usuario_id: user?.id || null,
        timestamp: new Date().toISOString(),
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay partidos disponibles para este grupo.</p>
      </div>
    );
  }

  const jornadasUnicas = [...new Set(matches.map(m => m.jornada))].sort((a, b) => a - b);

  return (
    <div className="space-y-8">
      {jornadasUnicas.map(jornada => (
        <div key={jornada}>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Jornada {jornada}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches
              .filter(m => m.jornada === jornada)
              .map(match => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onSave={handleSaveMatch}
                  canEdit={canEdit}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
