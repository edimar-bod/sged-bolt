import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Standing } from '../lib/supabase';
import { Trophy, TrendingUp } from 'lucide-react';

interface TablaTabProps {
  grupo: 'A' | 'B' | 'C';
}

export function TablaTab({ grupo }: TablaTabProps) {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStandings();

    const channel = supabase
      .channel('standings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'standings' }, () => {
        fetchStandings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [grupo]);

  const fetchStandings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('standings')
      .select('*')
      .eq('grupo', grupo)
      .order('posicion', { ascending: true });

    if (error) {
      console.error('Error fetching standings:', error);
    } else {
      setStandings(data || []);
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

  const getDifColor = (dif: number) => {
    if (dif > 0) return 'text-green-600';
    if (dif < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-800">Tabla de Posiciones - Grupo {grupo}</h2>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-2">
        <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
        <div className="text-sm text-blue-800">
          <strong>Criterios de ordenamiento FVF:</strong> Puntos (DESC) → Diferencia de Goles (DESC) → Goles a Favor (DESC)
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-green-500 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold">#</th>
                <th className="px-4 py-3 text-left text-sm font-bold">Equipo</th>
                <th className="px-3 py-3 text-center text-sm font-bold">PTS</th>
                <th className="px-3 py-3 text-center text-sm font-bold hidden sm:table-cell">PJ</th>
                <th className="px-3 py-3 text-center text-sm font-bold hidden sm:table-cell">G</th>
                <th className="px-3 py-3 text-center text-sm font-bold hidden sm:table-cell">E</th>
                <th className="px-3 py-3 text-center text-sm font-bold hidden sm:table-cell">P</th>
                <th className="px-3 py-3 text-center text-sm font-bold hidden lg:table-cell">GF</th>
                <th className="px-3 py-3 text-center text-sm font-bold hidden lg:table-cell">GC</th>
                <th className="px-3 py-3 text-center text-sm font-bold">DIF</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((standing, index) => (
                <tr
                  key={standing.id}
                  className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                    index === 0 ? 'bg-yellow-50' : ''
                  }`}
                >
                  <td className="px-4 py-4 text-center font-bold">
                    {index === 0 ? (
                      <div className="flex items-center gap-1">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <span>{standing.posicion}</span>
                      </div>
                    ) : (
                      standing.posicion
                    )}
                  </td>
                  <td className="px-4 py-4 font-semibold text-gray-800">{standing.equipo}</td>
                  <td className="px-3 py-4 text-center font-bold text-lg text-blue-600">
                    {standing.pts}
                  </td>
                  <td className="px-3 py-4 text-center hidden sm:table-cell">{standing.pj}</td>
                  <td className="px-3 py-4 text-center text-green-600 hidden sm:table-cell">{standing.g}</td>
                  <td className="px-3 py-4 text-center text-gray-600 hidden sm:table-cell">{standing.e}</td>
                  <td className="px-3 py-4 text-center text-red-600 hidden sm:table-cell">{standing.p}</td>
                  <td className="px-3 py-4 text-center hidden lg:table-cell">{standing.gf}</td>
                  <td className="px-3 py-4 text-center hidden lg:table-cell">{standing.gc}</td>
                  <td className={`px-3 py-4 text-center font-bold ${getDifColor(standing.dif)}`}>
                    {standing.dif > 0 ? '+' : ''}{standing.dif}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {standings.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay datos de la tabla aún. Los resultados aparecerán cuando se jueguen partidos.
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>PTS:</strong> Puntos | <strong>PJ:</strong> Partidos Jugados | <strong>G:</strong> Ganados | <strong>E:</strong> Empatados | <strong>P:</strong> Perdidos</p>
        <p><strong>GF:</strong> Goles a Favor | <strong>GC:</strong> Goles en Contra | <strong>DIF:</strong> Diferencia de Goles</p>
        <p className="mt-2"><strong>Sistema de puntuación FVF:</strong> Victoria = 3 pts | Empate = 1 pt | Derrota = 0 pts</p>
      </div>
    </div>
  );
}
