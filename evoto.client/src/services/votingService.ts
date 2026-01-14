import type { Candidate, VoteResult, ServiceResponse } from '../types';

const env = import.meta.env as Record<string, string | undefined>;
const BFF_BASE_URL = env.VITE_BFF_BASE_URL ?? '/api/bff/voting';

const jsonHeaders: HeadersInit = {
    'Content-Type': 'application/json;/json; charset=utf-8'
};

async function request<T>(path: string, init?: RequestInit): Promise<ServiceResponse<T>> {
  try {
    const response = await fetch(`${BFF_BASE_URL}${path}`, init);
    return await parseResponse<T>(response);
  } catch (error) {
    console.error('BFF request failed', error);
    return { success: false, error: 'Não foi possível comunicar com o BFF.' };
  }
}

async function parseResponse<T>(response: Response): Promise<ServiceResponse<T>> {
  try {
    const payload = await response.json() as ServiceResponse<T>;
    if (!response.ok && payload.error) {
      return { success: false, error: payload.error };
    }
    return payload;
  } catch {
    if (!response.ok) {
      return { success: false, error: `Erro ${response.status}` };
    }
    return { success: false, error: 'Resposta inválida do BFF.' };
  }
}

export const VotingService = {
  async issueCredential(ccNumber: string): Promise<ServiceResponse<string>> {
    return request<string>('/credential', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ citizenCardNumber: ccNumber })
    });
  },

  async getCandidates(): Promise<ServiceResponse<Candidate[]>> {
    return request<Candidate[]>('/candidates');
  },

  async submitVote(credential: string, candidateId: number): Promise<ServiceResponse<boolean>> {
    return request<boolean>('/vote', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ credential, candidateId })
    });
  },

  async getResults(): Promise<ServiceResponse<VoteResult[]>> {
    return request<VoteResult[]>('/results');
  }
};