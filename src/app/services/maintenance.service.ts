import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Entretien, StatsMaintenance } from '../Modeles/maintenance';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  private readonly apiUrl = 'http://localhost:8080/api/maintenances';

  entretiens = signal<Entretien[]>([]);
  filtreStatut = signal<string>('tous');
  searchQuery = signal('');

  constructor(private http: HttpClient) {
    this.loadEntretiens();
  }

  loadEntretiens(): void {
    this.http.get<Entretien[]>(this.apiUrl).subscribe({
      next: data => this.entretiens.set(data.map(e => this.normalizeEntretien(e))),
      error: err => console.error('Erreur chargement maintenances', err)
    });
  }

  getStats(): StatsMaintenance {
    const entretiens = this.entretiens();
    const maintenant = new Date();
    const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);

    const planifies = entretiens.filter(e => e.statut === 'planifie').length;
    const enCours = entretiens.filter(e => e.statut === 'en_cours').length;
    const termines = entretiens.filter(e => e.statut === 'termine').length;
    const coutTotal = entretiens
      .filter(e => e.statut === 'termine' && e.dateFin && new Date(e.dateFin) >= debutMois)
      .reduce((sum, e) => sum + (e.coutReel || e.coutEstime || 0), 0);

    return { planifies, enCours, termines, coutTotal };
  }

  getFilteredEntretiens(): Entretien[] {
    const filtre = this.filtreStatut();
    const query = this.searchQuery().toLowerCase();
    let filtered = this.entretiens();

    if (filtre !== 'tous') {
      filtered = filtered.filter(e => e.statut === filtre);
    }

    if (query) {
      filtered = filtered.filter(e =>
        e.titre?.toLowerCase().includes(query) ||
        e.description?.toLowerCase().includes(query) ||
        e.vehiculeImmatriculation?.toLowerCase().includes(query) ||
        e.vehiculeMarque?.toLowerCase().includes(query) ||
        e.vehiculeModele?.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) =>
      new Date(b.datePlanifiee).getTime() - new Date(a.datePlanifiee).getTime()
    );
  }

  getStatutsCount() {
    const entretiens = this.entretiens();
    return {
      tous: entretiens.length,
      planifie: entretiens.filter(e => e.statut === 'planifie').length,
      en_cours: entretiens.filter(e => e.statut === 'en_cours').length,
      termine: entretiens.filter(e => e.statut === 'termine').length
    };
  }

  addEntretien(entretien: Omit<Entretien, 'id'>): void {
    this.http.post<Entretien>(this.apiUrl, entretien).subscribe({
      next: created => this.entretiens.update(list => [...list, this.normalizeEntretien(created)]),
      error: err => console.error('Erreur ajout maintenance', err)
    });
  }

  updateEntretien(id: number, updatedEntretien: Partial<Entretien>): void {
    this.http.put<Entretien>(`${this.apiUrl}/${id}`, updatedEntretien).subscribe({
      next: updated => this.entretiens.update(list =>
        list.map(entretien => entretien.id === id ? this.normalizeEntretien(updated) : entretien)
      ),
      error: err => console.error('Erreur modification maintenance', err)
    });
  }

  deleteEntretien(id: number): void {
    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
      next: () => this.entretiens.update(list => list.filter(entretien => entretien.id !== id)),
      error: err => console.error('Erreur suppression maintenance', err)
    });
  }

  private normalizeEntretien(entretien: Entretien): Entretien {
    return {
      ...entretien,
      datePlanifiee: new Date(entretien.datePlanifiee),
      dateDebut: entretien.dateDebut ? new Date(entretien.dateDebut) : undefined,
      dateFin: entretien.dateFin ? new Date(entretien.dateFin) : undefined,
      titre: entretien.titre || entretien.type,
      description: entretien.description || '',
      urgence: entretien.urgence || 'moyenne'
    };
  }
}
