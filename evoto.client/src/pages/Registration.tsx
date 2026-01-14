import React, { useState } from 'react';
import { CreditCard, Loader2, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { VotingService } from '../services/votingService';

type RegistrationResult = 'idle' | 'success' | 'ineligible';

const isIneligibleMessage = (message: string): boolean => {
  const normalized = message
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  return normalized.includes('nao elegivel') || normalized.includes('not eligible');
};

export const Registration: React.FC = () => {
  const [ccNumber, setCcNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credential, setCredential] = useState<string | null>(null);
  const [resultStatus, setResultStatus] = useState<RegistrationResult>('idle');
  const [resultMessage, setResultMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setCredential(null);
    setResultStatus('idle');
    setResultMessage('');

    try {
      const response = await VotingService.issueCredential(ccNumber);
      if (response.success && response.data) {
        setCredential(response.data);
        setResultStatus('success');
        setResultMessage('Credencial emitida com sucesso.');
      } else {
        const message = response.error || "Erro desconhecido ao comunicar com a AR.";
        if (isIneligibleMessage(message)) {
          setResultStatus('ineligible');
          setResultMessage(message);
        } else {
          setError(message);
        }
      }
    } catch (err) {
      setError("Falha na comunicação com o serviço.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (credential) {
      navigator.clipboard.writeText(credential);
      alert("Credencial copiada!");
    }
  };

  const resetFlow = () => {
    setCcNumber('');
    setCredential(null);
    setError(null);
    setResultStatus('idle');
    setResultMessage('');
  };

  const showResult = resultStatus !== 'idle';
  const isSuccess = resultStatus === 'success';
  
  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl border border-slate-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Emissão de Credencial</h2>
        <p className="text-slate-500 text-sm mt-2">
          Introduza o seu número de Cartão de Cidadão para obter o seu boletim de voto eletrónico.
        </p>
      </div>

      {!showResult ? (
        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="cc" className="block text-sm font-medium text-slate-700">
              Número de Cartão de Cidadão
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCard className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="cc"
                type="text"
                value={ccNumber}
                onChange={(e) => setCcNumber(e.target.value)}
                placeholder="12345678"
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !ccNumber}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 focus:ring-4 focus:ring-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                Validando com a AR...
              </>
            ) : (
              'Solicitar Credencial'
            )}
          </button>
        </form>
      ) : (
        <div className="text-center space-y-6">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
              isSuccess ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
            }`}
          >
            {isSuccess ? (
              <CheckCircle className="h-8 w-8" />
            ) : (
              <AlertCircle className="h-8 w-8" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {isSuccess ? 'Credencial Emitida!' : 'Eleitor não elegível'}
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              {isSuccess
                ? 'Guarde este código. Irá precisar dele para votar.'
                : resultMessage || 'A AR indicou que o eleitor não está autorizado a votar neste ato.'}
            </p>
          </div>

          {isSuccess ? (
            <>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative group">
                <code className="text-xl font-mono font-bold text-slate-800 tracking-wider">
                  {credential}
                </code>
                <button
                  onClick={copyToClipboard}
                  className="absolute right-2 top-2 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition"
                  title="Copiar"
                >
                  <Copy size={16} />
                </button>
              </div>

              <div className="text-left bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                <strong>Nota de Segurança:</strong> Esta credencial garante o seu anonimato. A Autoridade de Votação (AV) não consegue associar este código à sua identidade civil.
              </div>
            </>
          ) : (
            <div className="text-left bg-amber-50 p-4 rounded-lg text-sm text-amber-900 border border-amber-200">
              <strong>Revisão necessária:</strong> {resultMessage || 'Verifique a situação do eleitor junto da Autoridade de Registo.'}
            </div>
          )}

          <button
            onClick={resetFlow}
            className="text-slate-600 hover:text-slate-900 text-sm font-medium underline"
          >
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  );
};