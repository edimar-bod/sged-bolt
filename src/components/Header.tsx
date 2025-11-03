import { Trophy } from 'lucide-react';

interface HeaderProps {
  selectedGroup: 'A' | 'B' | 'C';
  onGroupChange: (group: 'A' | 'B' | 'C') => void;
  selectedTab: 'jornada' | 'calendario' | 'tabla';
  onTabChange: (tab: 'jornada' | 'calendario' | 'tabla') => void;
  userEmail?: string;
}

export function Header({ selectedGroup, onGroupChange, selectedTab, onTabChange, userEmail }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-10 h-10" />
            <div>
              <h1 className="text-2xl font-bold">COPA DORADA</h1>
              <p className="text-sm opacity-90">Fundación Corazón de Azúcar</p>
            </div>
          </div>
          {userEmail && (
            <div className="text-sm opacity-90">
              {userEmail}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => onGroupChange('A')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedGroup === 'A'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'bg-blue-700 hover:bg-blue-800'
              }`}
            >
              Grupo A
            </button>
            <button
              onClick={() => onGroupChange('B')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedGroup === 'B'
                  ? 'bg-white text-green-600 shadow-md'
                  : 'bg-green-700 hover:bg-green-800'
              }`}
            >
              Grupo B
            </button>
            <button
              onClick={() => onGroupChange('C')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedGroup === 'C'
                  ? 'bg-white text-gray-600 shadow-md'
                  : 'bg-gray-700 hover:bg-gray-800'
              }`}
            >
              Grupo C
            </button>
          </div>

          <div className="flex gap-2 flex-1 justify-end">
            <button
              onClick={() => onTabChange('jornada')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedTab === 'jornada'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              Jornada
            </button>
            <button
              onClick={() => onTabChange('calendario')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedTab === 'calendario'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              Calendario
            </button>
            <button
              onClick={() => onTabChange('tabla')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedTab === 'tabla'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              Tabla
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
