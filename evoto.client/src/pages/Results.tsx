import React, { useEffect, useState } from 'react';
import { VotingService } from '../services/votingService';
import type { VoteResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Loader2, RefreshCw } from 'lucide-react';

export const Results: React.FC = () => {
  const [results, setResults] = useState<VoteResult[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await VotingService.getResults();
      if (response.success && response.data) {
        setResults(response.data);
      }
    } catch (e) {
      console.error("Failed to fetch results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // Custom colors for the chart
  const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b'];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Resultados Provisórios</h2>
          <p className="text-slate-500">Dados fornecidos pela Autoridade de Apuramento (AA).</p>
        </div>
        <button 
          onClick={fetchResults}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition"
          title="Atualizar"
        >
          <RefreshCw className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && results.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 text-slate-300 animate-spin" />
        </div>
      ) : (
        <>
          {/* Main Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={results} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="candidateName" 
                  type="category" 
                  width={150} 
                  tick={{ fontSize: 14, fill: '#475569', fontWeight: 500 }}
                  interval={0}
                />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="votes" radius={[0, 4, 4, 0]} barSize={40}>
                  {results.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
         
          {/* Detailed Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {results.map((result, index) => (
              <div key={result.candidateId} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition">
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <h3 className="font-bold text-slate-800 truncate">{result.candidateName}</h3>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-3xl font-extrabold text-slate-900">{result.percentage.toFixed(1)}%</span>
                  </div>
                  <span className="text-sm font-medium text-slate-400">{result.votes.toLocaleString()} votos</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${result.percentage}%`,
                      backgroundColor: COLORS[index % COLORS.length]
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-4 bg-slate-50 rounded-lg text-xs text-slate-400 text-center">
             Apuramento processado em: {new Date().toLocaleString()} • Hash da última contagem: {Math.random().toString(16).slice(2)}
          </div>
        </>
      )}
    </div>
  );
};