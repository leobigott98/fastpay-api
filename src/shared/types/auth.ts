export type JwtUser = {
  sub: string;
  iss?: string;
  aud?: string | string[];
  scope?: string;
  exp?: number;
  iat?: number;
};