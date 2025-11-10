import { AuthResponse } from '../../../shared/types';
import { apiRequest } from '../../../shared/lib/api/http';

export interface LoginCredentials {
  email: string;
  password: string;
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/v3/login', {
    method: 'POST',
    body: JSON.stringify({ ...credentials, wt: true }),
  });
}

