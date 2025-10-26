export interface Candidate {
  candidateId: number;
  fullName: string;
  party: string;
  biography: string;
  photoUrl: string;
  createdAt: string;   // أو Date لو بتحولها
  electionId: number;
  electionTitle: string;
  votesCount: number;
}
