import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Alerte } from '../Modeles/alerte';

@Injectable({
  providedIn: 'root'
})
export class AlerteService {
  private readonly apiUrl = '/api/alertes';

  alertes = signal<Alerte[]>([]);
  filtreType = signal<string>('tous');
  filtreStatut = signal<string>('tous');
  searchQuery = signal('');
  private isLoading = false;

  constructor(private http: HttpClient) {}

  loadAlertes(): void {
    if (this.isLoading) {
      return;
    }
    this.isLoading = true;
    this.http.get<Alerte[]>(this.apiUrl).subscribe({
      next: data => {
        this.alertes.set(data.map(a => this.normalizeAlerte(a)));
        this.isLoading = false;
      },
      error: err => {
        console.error('Erreur chargement alertes', err);
        this.isLoading = false;
      }
    });
  }

  getFilteredAlertes(): Alerte[] {
    const type = this.filtreType();
    const statut = this.filtreStatut();
    const query = this.searchQuery().toLowerCase();
    let filtered = this.alertes();

    if (type !== 'tous') {
      filtered = filtered.filter(a => a.type === type);
    }

    if (statut !== 'tous') {
      filtered = filtered.filter(a => a.statut === statut);
    }

    if (query) {
      filtered = filtered.filter(a =>
        a.titre?.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query) ||
        a.vehiculeMarque?.toLowerCase().includes(query) ||
        a.vehiculeModele?.toLowerCase().includes(query) ||
        a.vehiculeImmatriculation?.toLowerCase().includes(query) ||
        a.chauffeurNom?.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) =>
      new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime()
    );
  }

  getStats() {
    const alertes = this.alertes();
    const maintenant = new Date();
    const dansUneSemaine = new Date();
    dansUneSemaine.setDate(maintenant.getDate() + 7);

    const actives = alertes.filter(a => a.statut === 'active').length;
    const critiques = alertes.filter(a => a.statut === 'active' && a.priorite === 'critique').length;
    const expirant = alertes.filter(a =>
      a.statut === 'active' &&
      a.dateEcheance &&
      a.dateEcheance <= dansUneSemaine &&
      a.dateEcheance >= maintenant
    ).length;
    const expirees = alertes.filter(a => a.statut === 'expiree').length;

    return { total: alertes.length, actives, critiques, expirant, expirees };
  }

  addAlerte(alerte: Omit<Alerte, 'id'>): void {
    this.http.post<Alerte>(this.apiUrl, alerte).subscribe({
      next: created => this.alertes.update(list => [...list, this.normalizeAlerte(created)]),
      error: err => this.handleError('Erreur ajout alerte', err)
    });
  }

  updateAlerte(id: number, updatedAlerte: Partial<Alerte>): void {
    this.http.put<Alerte>(`${this.apiUrl}/${id}`, updatedAlerte).subscribe({
      next: updated => this.alertes.update(list =>
        list.map(alerte => alerte.id === id ? this.normalizeAlerte(updated) : alerte)
      ),
      error: err => this.handleError('Erreur modification alerte', err)
    });
  }

  deleteAlerte(id: number): void {
    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
      next: () => this.alertes.update(list => list.filter(alerte => alerte.id !== id)),
      error: err => this.handleError('Erreur suppression alerte', err)
    });
  }

  marquerCommeResolue(id: number): void {
    this.http.patch<Alerte>(`${this.apiUrl}/${id}/resoudre`, {}).subscribe({
      next: updated => this.alertes.update(list =>
        list.map(alerte => alerte.id === id ? this.normalizeAlerte(updated) : alerte)
      ),
      error: err => this.handleError('Erreur resolution alerte', err)
    });
  }

  getTypes() {
    const types = this.alertes().map(a => a.type);
    return ['tous', ...new Set(types)];
  }

  getStatuts() {
    const statuts = this.alertes().map(a => a.statut);
    return ['tous', ...new Set(statuts)];
  }

  private normalizeAlerte(alerte: Alerte): Alerte {
    return {
      ...alerte,
      dateCreation: new Date(alerte.dateCreation),
      dateEcheance: alerte.dateEcheance ? new Date(alerte.dateEcheance) : undefined
    };
  }

  private handleError(message: string, err: any): void {
    console.error(message, err);
    if (err?.status === 403) {
      alert("Vous n'avez pas droit");
    }
  }
}
