export interface Token {
  token: string;
  expiresAt?: Date;
}

export interface DecodedToken {
  exp: number;
  iat: number;
  userId: string;
  email: string;
  fullName: string;
}