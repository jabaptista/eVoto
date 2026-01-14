import React from 'react';
import { ArrowRight, ShieldCheck, UserCheck, Lock } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-12 py-8">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Eleições Presidenciais <span className="text-red-600">2026</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600">
          Bem-vindo à plataforma oficial de voto eletrónico. 
          Exerça o seu direito de forma segura, anónima e auditável.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={() => onNavigate('register')}
            className="px-8 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition shadow-lg flex items-center gap-2"
          >
            Obter Credencial <ArrowRight size={18} />
          </button>
          <button
            onClick={() => onNavigate('results')}
            className="px-8 py-3 bg-white text-slate-700 border border-slate-300 font-semibold rounded-lg hover:bg-slate-50 transition shadow-sm"
          >
            Ver Resultados
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
            <UserCheck size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">1. Identificação</h3>
          <p className="text-slate-600">
            A Autoridade de Registo (AR) valida a sua identidade através do Cartão de Cidadão e emite uma credencial única.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
            <Lock size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">2. Voto Anónimo</h3>
          <p className="text-slate-600">
            O seu voto é cifrado e submetido à Autoridade de Votação (AV). A credencial garante que vota apenas uma vez.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">3. Auditoria</h3>
          <p className="text-slate-600">
            A Autoridade de Apuramento (AA) desencripta e contabiliza os votos sem nunca associar a identidade ao boletim.
          </p>
        </div>
      </div>
    </div>
  );
};