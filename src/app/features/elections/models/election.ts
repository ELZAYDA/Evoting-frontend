export interface Election {
  electionId: number;
  electionName: string;
  description: string;
  startDate: string;
  endDate: string;
  status: boolean;
  candidatesCount: number;
  candidates?: Candidate[];
  winner?: Candidate;
  state?: number;
  stateName?: string;
}

export interface Candidate {
  id: number;
  name: string;
  voteCount: number;
  party: string;
  age: number;
  qualification: string;
  percentage?: number;
  selected?: boolean;
}