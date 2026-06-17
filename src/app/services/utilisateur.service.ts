import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Utilisateur } from '../Modeles/utilisateur';
import { Observable, tap } from 'rxjs';

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

  addUtilisateur(utilisateur: Omit<Utilisateur, 'id'>): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(this.apiUrl, utilisateur).pipe(
      tap(created => this.utilisateurs.update(list => [...list, created]))
    );
  }

  updateUtilisateur(id: number, utilisateur: Partial<Utilisateur>): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${this.apiUrl}/${id}`, utilisateur).pipe(
      tap(updated => this.utilisateurs.update(list => list.map(u => u.id === id ? updated : u)))
    );
  }

  deleteUtilisateur(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.utilisateurs.update(list => list.filter(u => u.id !== id)))
    );
  }
}
