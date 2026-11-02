import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Plein, StatCarburant, EvolutionMensuelle } from '../Modeles/carburant';

@Injectable({
  providedIn: 'root'
})
export class CarburantService {
  private readonly apiUrl = '/api/carburants';

  pleins = signal<Plein[]>([]);
  evolutionMensuelle = signal<EvolutionMensuelle[]>([]);
  filtreVehicule = signal<string>('tous');
  searchQuery = signal('');

  constructor(private http: HttpClient) {
    this.loadPleins();
  }

  loadPleins(): void {
    this.http.get<Plein[]>(this.apiUrl).subscribe({
      next: data => {
        this.pleins.set(data.map(p => ({ ...p, date: new Date(p.date) })));
        this.evolutionMensuelle.set(this.buildEvolutionMensuelle(this.pleins()));
      },
      error: err => console.error('Erreur chargement carburant', err)
    });
  }

  getStats(): StatCarburant {
    const pleinsFiltres = this.getFilteredPleins();
    const consommationTotale = pleinsFiltres.reduce((sum, plein) => sum + (plein.quantite || 0), 0);
    const coutTotal = pleinsFiltres.reduce((sum, plein) => sum + (plein.cout || 0), 0);
    const prixMoyen = consommationTotale > 0 ? coutTotal / consommationTotale : 0;
    const vehicules = [...new Set(pleinsFiltres.map(p => p.vehiculeImmatriculation).filter(Boolean))];

    return { consommationTotale, coutTotal, prixMoyen, vehicules };
  }

  getFilteredPleins(): Plein[] {
    const filtre = this.filtreVehicule();
    const query = this.searchQuery().toLowerCase();
    let filtered = this.pleins();

    if (filtre !== 'tous') {
      filtered = filtered.filter(p => p.vehiculeImmatriculation === filtre);
    }

    if (query) {
      filtered = filtered.filter(p =>
        p.vehiculeImmatriculation?.toLowerCase().includes(query) ||
        p.station?.toLowerCase().includes(query) ||
        p.vehiculeMarque?.toLowerCase().includes(query) ||
        p.vehiculeModele?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  addPlein(plein: Omit<Plein, 'id'>): void {
    this.http.post<Plein>(this.apiUrl, plein).subscribe({
      next: created => this.pleins.update(list => [...list, { ...created, date: new Date(created.date) }]),
      error: err => console.error('Erreur ajout plein', err)
    });
  }

  updatePlein(id: number, updatedPlein: Partial<Plein>): void {
    this.http.put<Plein>(`${this.apiUrl}/${id}`, updatedPlein).subscribe({
      next: updated => this.pleins.update(list =>
        list.map(plein => plein.id === id ? { ...updated, date: new Date(updated.date) } : plein)
      ),
      error: err => console.error('Erreur modification plein', err)
    });
  }

  deletePlein(id: number): void {
    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
      next: () => this.pleins.update(list => list.filter(plein => plein.id !== id)),
      error: err => console.error('Erreur suppression plein', err)
    });
  }

  getEvolutionData(): EvolutionMensuelle[] {
    return this.evolutionMensuelle();
  }

  getConsommationParVehicule() {
    const vehiculesMap = new Map<string, number>();

    this.pleins().forEach(plein => {
      const current = vehiculesMap.get(plein.vehiculeImmatriculation) || 0;
      vehiculesMap.set(plein.vehiculeImmatriculation, current + (plein.quantite || 0));
    });

    return Array.from(vehiculesMap.entries()).map(([vehicule, consommation]) => ({ vehicule, consommation }));
  }

  private buildEvolutionMensuelle(pleins: Plein[]): EvolutionMensuelle[] {
    const formatter = new Intl.DateTimeFormat('fr-FR', { month: 'short' });
    const data = new Map<string, EvolutionMensuelle>();

    pleins.forEach(plein => {
      const date = new Date(plein.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const mois = formatter.format(date);
      const current = data.get(key) || { mois, consommation: 0, cout: 0 };
      current.consommation += plein.quantite || 0;
      current.cout += plein.cout || 0;
      data.set(key, current);
    });

    return Array.from(data.values());
  }
}
