export interface Election {
  electionId: number;
  electionName: string;
  description: string;
  startDate: string;   // أو Date لو هتعمل parse
  endDate: string;     // أو Date
  status: boolean;
  createdAt: string;   // أو Date
  candidatesCount: number;
}