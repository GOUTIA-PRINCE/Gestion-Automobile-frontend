import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Parametre } from '../Modeles/parametre';

@Injectable({
  providedIn: 'root'
})
export class ParametreService {
  private readonly apiUrl = '/api/parametres';

  parametres = signal<Parametre[]>([]);
  searchQuery = signal('');

  filteredParametres = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.parametres();

    return this.parametres().filter(p =>
      p.cleParametre?.toLowerCase().includes(query) ||
      p.valeur?.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query) ||
      p.categorie?.toLowerCase().includes(query)
    );
  });

  constructor(private http: HttpClient) {
    this.loadParametres();
  }

  loadParametres(): void {
    this.http.get<Parametre[]>(this.apiUrl).subscribe({
      next: data => this.parametres.set(data),
      error: err => console.error('Erreur chargement parametres', err)
    });
  }

  addParametre(parametre: Omit<Parametre, 'id'>): void {
    this.http.post<Parametre>(this.apiUrl, parametre).subscribe({
      next: created => this.parametres.update(list => [...list, created]),
      error: err => console.error('Erreur ajout parametre', err)
    });
  }

  updateParametre(id: number, parametre: Partial<Parametre>): void {
    this.http.put<Parametre>(`${this.apiUrl}/${id}`, parametre).subscribe({
      next: updated => this.parametres.update(list => list.map(p => p.id === id ? updated : p)),
      error: err => console.error('Erreur modification parametre', err)
    });
  }

  deleteParametre(id: number): void {
    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
      next: () => this.parametres.update(list => list.filter(p => p.id !== id)),
      error: err => console.error('Erreur suppression parametre', err)
    });
  }
}
