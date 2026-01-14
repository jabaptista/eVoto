import React, { useEffect, useState } from 'react';
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { VotingService } from '../services/votingService';
import type { Candidate } from '../types';
import { VoteStatus } from '../types';

export const Voting: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(true);
  
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [credential, setCredential] = useState('');
  const [voteStatus, setVoteStatus] = useState<VoteStatus>(VoteStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await VotingService.getCandidates();
        if (response.success && response.data) {
          setCandidates(response.data);
        }
      } catch (e) {
        console.error("Failed to load candidates");
      } finally {
        setIsLoadingCandidates(false);
      }
    };
    fetchCandidates();
  }, []);

  const handleVote = async () => {
    if (!selectedCandidate || !credential) return;

    setVoteStatus(VoteStatus.LOADING);
    setErrorMessage(null);

    try {
      const response = await VotingService.submitVote(credential, selectedCandidate);
      if (response.success) {
        setVoteStatus(VoteStatus.SUCCESS);
      } else {
        setVoteStatus(VoteStatus.ERROR);
        setErrorMessage(response.error || "Erro ao submeter voto.");
      }
    } catch (e) {
      setVoteStatus(VoteStatus.ERROR);
      setErrorMessage("Erro de comunicação com a Autoridade de Votação.");
    }
  };

  const resetVote = () => {
    setVoteStatus(VoteStatus.IDLE);
    setSelectedCandidate(null);
    setCredential('');
    setErrorMessage(null);
  };

  if (voteStatus === VoteStatus.SUCCESS) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-8 bg-white rounded-2xl shadow-xl text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Voto Aceite!</h2>
        <p className="text-slate-600">
          O seu voto foi cifrado e depositado com sucesso na urna digital da Autoridade de Votação.
        </p>
        <button 
          onClick={resetVote}
          className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Boletim de Voto</h2>
        <p className="text-slate-500">Selecione o seu candidato e valide com a sua credencial.</p>
      </div>

      {isLoadingCandidates ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin h-10 w-10 text-slate-400" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              onClick={() => setSelectedCandidate(candidate.id)}
              className={`relative cursor-pointer rounded-xl border-2 overflow-hidden transition-all duration-200 group ${
                selectedCandidate === candidate.id
                  ? 'border-slate-900 ring-2 ring-slate-900 ring-offset-2 shadow-lg'
                  : 'border-slate-200 hover:border-slate-400 hover:shadow-md bg-white'
              }`}
            >
              <div className="flex items-start p-4 gap-4">
                <img 
                  src={candidate.image} 
                  alt={candidate.name} 
                  className="w-20 h-20 rounded-lg object-cover bg-slate-100"
                />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{candidate.name}</h3>
                  <p className="text-sm font-semibold text-red-600 mb-1">{candidate.party}</p>
                </div>
              </div>
              {selectedCandidate === candidate.id && (
                <div className="absolute top-2 right-2 text-slate-900 bg-white rounded-full p-1 shadow-sm">
                  <CheckCircle2 size={20} fill="currentColor" className="text-white" stroke="black"/>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Voting Actions Area */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 sticky bottom-4 shadow-xl backdrop-blur-sm bg-opacity-90">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:flex-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Credencial de Voto
            </label>
            <input
              type="text"
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              placeholder="Cole aqui a sua credencial (ex: CRED-ABC-123)"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
          </div>
          <div className="w-full md:w-auto">
            <button
              onClick={handleVote}
              disabled={!selectedCandidate || !credential || voteStatus === VoteStatus.LOADING}
              className="w-full md:w-auto px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {voteStatus === VoteStatus.LOADING ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                'VOTAR'
              )}
            </button>
          </div>
        </div>
        
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2 text-sm">
            <AlertTriangle size={16} />
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};