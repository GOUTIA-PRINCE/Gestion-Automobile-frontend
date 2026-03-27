import { Injectable, signal, computed } from '@angular/core';
import { Chauffeur } from '../Modeles/chauffeur';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChauffeurService {

  private apiUrl = 'http://localhost:8080/api/chauffeurs';

  constructor(private http: HttpClient) {}

  // signals pour stocker les données et la recherche
  chauffeurs = signal<Chauffeur[]>([]);
  searchQuery = signal('');

  // Récupère les chauffeurs depuis l'API
  getChauffeurs() {
    return this.http.get<Chauffeur[]>(this.apiUrl);
  }

  loadChauffeurs() {
    this.getChauffeurs().subscribe({
      next: data => {
        this.chauffeurs.set(data);
        console.log('Chauffeurs chargés :', data);
      },
      error: err => {
        console.error('Erreur API', err);
      }
    });
  }

  // filtrer les chauffeurs selon la recherche
  filteredChauffeurs = computed(() => {
    const query = this.searchQuery().toLowerCase();

    if (!query) return this.chauffeurs();

    return this.chauffeurs().filter(c =>
      c.nom?.toLowerCase().includes(query) ||
      c.prenom?.toLowerCase().includes(query) ||
      c.telephone?.includes(query) ||
      c.email?.toLowerCase().includes(query) ||
      c.numeroPermis?.toLowerCase().includes(query) ||
      (c.vehiculeAttribue?.immatriculation?.toLowerCase().includes(query) ?? false)
    );
  });

  // statistiques basiques
  stats = computed(() => ({
    total: this.chauffeurs().length,
    actifs: this.chauffeurs().filter(c => c.statut === 'actif').length,
    mission: this.chauffeurs().filter(c => c.statut === 'mission').length,
    conge: this.chauffeurs().filter(c => c.statut === 'congé').length,
    inactifs: this.chauffeurs().filter(c => c.statut === 'inactif').length
  }));

  // crud operations

  addChauffeur(chauffeur: Omit<Chauffeur, 'id'> & { vehiculeId?: number }) {
    return this.http.post<Chauffeur>(this.apiUrl, chauffeur).subscribe(newCh => {
      this.chauffeurs.update(list => [...list, newCh]);
    });
  }

  updateChauffeur(id: number, chauffeur: Chauffeur) {
    return this.http.put<Chauffeur>(`${this.apiUrl}/${id}`, chauffeur).subscribe(updated => {
      this.chauffeurs.update(list =>
        list.map(c => c.id === id ? updated : c)
      );
    });
  }

  deleteChauffeur(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        console.log(`Chauffeur ${id} supprimé avec succès`);
        this.chauffeurs.update(list => list.filter(c => c.id !== id));
      },
      error: err => {
        console.error('Erreur lors de la suppression du chauffeur :', err);
      }
    });
  }
}