import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Match } from '../lib/supabase';
import { Calendar } from 'lucide-react';

interface CalendarioTabProps {
  grupo: 'A' | 'B' | 'C';
}

export function CalendarioTab({ grupo }: CalendarioTabProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedJornada, setSelectedJornada] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
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
      if (data && data.length > 0) {
        setSelectedJornada(data[0].jornada);
      }
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const jornadasUnicas = [...new Set(matches.map(m => m.jornada))].sort((a, b) => a - b);
  const partidosJornada = matches.filter(m => m.jornada === selectedJornada);

  const formatDate = (fecha: string, hora: string) => {
    const date = new Date(fecha);
    const dateStr = date.toLocaleDateString('es-VE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
    return `${dateStr} - ${hora}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Calendario de Partidos</h2>
      </div>

      <div className="flex gap-2 flex-wrap">
        {jornadasUnicas.map(jornada => (
          <button
            key={jornada}
            onClick={() => setSelectedJornada(jornada)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              selectedJornada === jornada
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Jornada {jornada}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {partidosJornada.map(match => (
          <div
            key={match.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-[300px]">
                <span className="text-sm text-gray-500 font-medium">
                  Partido #{match.numero}
                </span>
                <div className="flex items-center gap-3 flex-1">
                  <span className="font-bold text-lg">{match.equipo_local}</span>
                  <span className="text-gray-400 font-semibold">vs</span>
                  <span className="font-bold text-lg">{match.equipo_visitante}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="font-medium">{match.cancha}</span>
                <span>{formatDate(match.fecha, match.hora)}</span>
              </div>

              {match.played && match.score_local !== null && match.score_visitante !== null && (
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                  <span className="text-2xl font-bold text-blue-600">
                    {match.score_local} - {match.score_visitante}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {partidosJornada.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay partidos programados para esta jornada.
          </div>
        )}
      </div>
    </div>
  );
}
