import { Utilisateur } from './utilisateur';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  utilisateur: Utilisateur;
}
