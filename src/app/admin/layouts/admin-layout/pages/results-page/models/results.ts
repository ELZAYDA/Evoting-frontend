export interface CandidateResult {
  candidateId: number;
  candidateName: string;
  party: string;
  totalVotes: number;
  percentage: number;
  rank: number;
}

export interface ResultsSummary {
  electionId: number;
  electionTitle: string;
  totalVotes: number;
  totalCandidates: number;
  candidates: CandidateResult[];
  generatedAt: string;
}

export interface Winner {
  electionId: number;
  electionTitle: string;
  winnerId: number;
  winnerName: string;
  winnerParty: string;
  totalVotes: number;
  percentage: number;
  margin: number;
}

export interface ElectionStatistics {
  electionId: number;
  electionTitle: string;
  totalVotes: number;
  totalCandidates: number;
  winner: string;
  votingRate: number;
  closeRace: boolean;
  generatedAt: string;
}