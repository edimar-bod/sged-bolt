import { useState } from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import type { Match } from '../lib/supabase';
import { validateScore } from '../utils/standings';

interface MatchCardProps {
  match: Match;
  onSave: (matchId: string, scoreLocal: number, scoreVisitante: number) => Promise<void>;
  canEdit: boolean;
}

export function MatchCard({ match, onSave, canEdit }: MatchCardProps) {
  const [scoreLocal, setScoreLocal] = useState(match.score_local?.toString() ?? '');
  const [scoreVisitante, setScoreVisitante] = useState(match.score_visitante?.toString() ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const localValidation = validateScore(scoreLocal);
  const visitanteValidation = validateScore(scoreVisitante);
  const isValid = localValidation.valid && visitanteValidation.valid;

  const handleSave = async () => {
    if (!isValid || saving) return;

    setSaving(true);
    setError('');

    try {
      await onSave(match.id, parseInt(scoreLocal), parseInt(scoreVisitante));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Error al guardar el resultado');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const getGroupColor = (grupo: string) => {
    switch (grupo) {
      case 'A':
        return 'bg-blue-600';
      case 'B':
        return 'bg-green-600';
      case 'C':
        return 'bg-gray-600';
      default:
        return 'bg-gray-600';
    }
  };

  const formatDate = (fecha: string, hora: string) => {
    const date = new Date(fecha);
    const days = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
    const day = days[date.getDay()];
    const dateStr = date.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: '2-digit' });
    return `${day}. ${dateStr} - ${hora}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={`${getGroupColor(match.grupo)} text-white px-3 py-1 rounded-md text-sm font-bold`}>
            {match.grupo}
          </span>
          <span className="text-gray-600 text-sm font-medium">
            Partido #{match.numero}
          </span>
          <span className="text-gray-400 text-xs">
            {match.match_id}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          {match.cancha}
        </div>
      </div>

      <div className="flex items-center justify-between gap-6 mb-4">
        <div className="flex-1 text-right">
          <p className="font-bold text-lg mb-2">{match.equipo_local}</p>
          {canEdit ? (
            <input
              type="number"
              min="0"
              max="99"
              value={scoreLocal}
              onChange={(e) => setScoreLocal(e.target.value)}
              className={`w-20 px-3 py-2 border rounded-lg text-center text-xl font-bold ${
                !localValidation.valid && scoreLocal !== ''
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              disabled={saving}
            />
          ) : (
            <div className="text-3xl font-bold">{match.score_local ?? '-'}</div>
          )}
        </div>

        <div className="text-2xl font-bold text-gray-400">VS</div>

        <div className="flex-1 text-left">
          <p className="font-bold text-lg mb-2">{match.equipo_visitante}</p>
          {canEdit ? (
            <input
              type="number"
              min="0"
              max="99"
              value={scoreVisitante}
              onChange={(e) => setScoreVisitante(e.target.value)}
              className={`w-20 px-3 py-2 border rounded-lg text-center text-xl font-bold ${
                !visitanteValidation.valid && scoreVisitante !== ''
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              disabled={saving}
            />
          ) : (
            <div className="text-3xl font-bold">{match.score_visitante ?? '-'}</div>
          )}
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 mb-4">
        {formatDate(match.fecha, match.hora)}
      </div>

      {canEdit && (
        <>
          {(!localValidation.valid || !visitanteValidation.valid) && (scoreLocal !== '' || scoreVisitante !== '') && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{localValidation.error || visitanteValidation.error}</span>
            </div>
          )}

          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={!isValid || saving}
            className={`w-full py-2 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              saved
                ? 'bg-green-500 text-white'
                : saving
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : isValid
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : saved ? (
              <>
                <Check className="w-5 h-5" />
                Guardado
              </>
            ) : (
              'Guardar'
            )}
          </button>

          {match.played && match.updated_at && (
            <p className="mt-2 text-xs text-gray-500 text-center">
              Última edición: {new Date(match.updated_at).toLocaleString('es-VE')}
            </p>
          )}
        </>
      )}

      {match.incomparecencia && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700 text-center">
          Marcado como incomparecencia
        </div>
      )}
    </div>
  );
}
