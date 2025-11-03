import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useAuth } from './hooks/useAuth';
import { Header } from './components/Header';
import { JornadaTab } from './components/JornadaTab';
import { CalendarioTab } from './components/CalendarioTab';
import { TablaTab } from './components/TablaTab';
import { AuthModal } from './components/AuthModal';
import { LogIn, LogOut } from 'lucide-react';

function App() {
  const { user, role, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState<'A' | 'B' | 'C'>('A');
  const [selectedTab, setSelectedTab] = useState<'jornada' | 'calendario' | 'tabla'>('jornada');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [equipos, setEquipos] = useState<{ a: string[]; b: string[]; c: string[] }>({
    a: [],
    b: [],
    c: []
  });

  useEffect(() => {
    fetchTournamentConfig();
  }, []);

  const fetchTournamentConfig = async () => {
    const { data } = await supabase
      .from('tournament_config')
      .select('*')
      .maybeSingle();

    if (data) {
      setEquipos({
        a: data.equipos_a || [],
        b: data.equipos_b || [],
        c: data.equipos_c || []
      });
    }
  };

  const getEquiposForGroup = (grupo: 'A' | 'B' | 'C') => {
    switch (grupo) {
      case 'A':
        return equipos.a;
      case 'B':
        return equipos.b;
      case 'C':
        return equipos.c;
    }
  };

  const canEdit = role === 'admin';

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">COPA DORADA</h1>
          <p className="text-gray-600 mb-8">Sistema de Gestión de Eventos Deportivos</p>

          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Iniciar Sesión
          </button>

          <p className="mt-6 text-sm text-gray-500">
            Fundación Corazón de Azúcar
          </p>
        </div>

        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onSignIn={signIn}
            onSignUp={signUp}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        selectedGroup={selectedGroup}
        onGroupChange={setSelectedGroup}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        userEmail={user.email}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {role && (
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                role === 'admin' ? 'bg-red-100 text-red-700' :
                role === 'user' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {role === 'admin' ? 'Administrador' : role === 'user' ? 'Usuario' : 'Visitante'}
              </span>
            )}
          </div>

          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-all text-gray-700 font-medium"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>

        {selectedTab === 'jornada' && (
          <JornadaTab
            grupo={selectedGroup}
            canEdit={canEdit}
            equipos={getEquiposForGroup(selectedGroup)}
          />
        )}

        {selectedTab === 'calendario' && (
          <CalendarioTab grupo={selectedGroup} />
        )}

        {selectedTab === 'tabla' && (
          <TablaTab grupo={selectedGroup} />
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-600">
          <p className="font-semibold mb-1">Sistema de Gestión de Eventos Deportivos (SGED)</p>
          <p>Conforme al Reglamento General de Competiciones - Federación Venezolana de Fútbol (FVF)</p>
          <p className="mt-2 text-xs">Fundación Corazón de Azúcar © 2024</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
