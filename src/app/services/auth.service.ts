import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthResponse, LoginRequest } from '../Modeles/auth';
import { Utilisateur } from '../Modeles/utilisateur';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = '/api/auth';
  private readonly tokenKey = 'fleetpro_token';
  private readonly userKey = 'fleetpro_user';

  token = signal<string | null>(this.storage()?.getItem(this.tokenKey) || null);
  currentUser = signal<Utilisateur | null>(this.readStoredUser());
  isAuthenticated = computed(() => !!this.token() && !!this.currentUser());

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials);
  }

  resetPassword(email: string, nouveauMotDePasse: string) {
    return this.http.post<void>(`${this.apiUrl}/reset-password`, { email, nouveauMotDePasse });
  }

  updateProfil(utilisateur: Partial<Utilisateur>) {
    return this.http.put<Utilisateur>('/api/profil', utilisateur);
  }

  refreshCurrentUser(utilisateur: Utilisateur): void {
    this.storage()?.setItem(this.userKey, JSON.stringify(utilisateur));
    this.currentUser.set(utilisateur);
  }

  setSession(response: AuthResponse): void {
    this.storage()?.setItem(this.tokenKey, response.token);
    this.storage()?.setItem(this.userKey, JSON.stringify(response.utilisateur));
    this.token.set(response.token);
    this.currentUser.set(response.utilisateur);
  }

  logout(): void {
    const token = this.token();
    if (token) {
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe({ error: () => undefined });
    }
    this.storage()?.removeItem(this.tokenKey);
    this.storage()?.removeItem(this.userKey);
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  hasPermission(permission: string): boolean {
    return this.currentUser()?.permissions?.includes(permission) ?? false;
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  private readStoredUser(): Utilisateur | null {
    const raw = this.storage()?.getItem(this.userKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Utilisateur;
    } catch {
      this.storage()?.removeItem(this.userKey);
      return null;
    }
  }

  private storage(): Storage | null {
    return typeof localStorage === 'undefined' ? null : localStorage;
  }
}
