export interface User {
  acsUserId: number;
  email?: string;
}

export interface AuthTokens {
  acsToken: string;
  acsTokenExpire: string;
  utipToken?: string;
}

