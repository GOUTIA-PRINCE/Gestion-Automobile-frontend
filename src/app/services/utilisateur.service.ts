import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Utilisateur } from '../Modeles/utilisateur';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private readonly apiUrl = 'http://localhost:8080/api/utilisateurs';

  utilisateurs = signal<Utilisateur[]>([]);

  constructor(private http: HttpClient) {
    this.loadUtilisateurs();
  }

  loadUtilisateurs(): void {
    this.http.get<Utilisateur[]>(this.apiUrl).subscribe({
      next: data => this.utilisateurs.set(data),
      error: err => console.error('Erreur chargement utilisateurs', err)
    });
  }

  addUtilisateur(utilisateur: Omit<Utilisateur, 'id'>): void {
    this.http.post<Utilisateur>(this.apiUrl, utilisateur).subscribe({
      next: created => this.utilisateurs.update(list => [...list, created]),
      error: err => console.error('Erreur ajout utilisateur', err)
    });
  }

  deleteUtilisateur(id: number): void {
    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
      next: () => this.utilisateurs.update(list => list.filter(u => u.id !== id)),
      error: err => console.error('Erreur suppression utilisateur', err)
    });
  }
}
