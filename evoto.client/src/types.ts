export interface Candidate {
  id: number;
  name: string;
  party: string;
  image: string;
}

export interface VoteResult {
  candidateId: number;
  candidateName: string;
  votes: number;
  percentage: number;
}

export interface VoterCredential {
  credential: string;
  issuedAt: Date;
}

export const VoteStatus = {
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR'
} as const;
export type VoteStatus = typeof VoteStatus[keyof typeof VoteStatus];

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}