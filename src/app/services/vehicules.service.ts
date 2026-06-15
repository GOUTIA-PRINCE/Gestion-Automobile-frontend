import { HttpClient } from '@angular/common/http';
import { Injectable, signal, computed } from '@angular/core';
import { Vehicules } from '../Modeles/vehicules';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VehiculesService {

  private apiUrl = 'http://localhost:8080/api/vehicules';

  // Constructeur pour injecter le HttpClient
  constructor(private http: HttpClient) { }

  // Signals pour stocker les données et la recherche
  vehicules = signal<Vehicules[]>([]);
  searchQuery = signal('');

  //Methode pour récupérer la liste des véhicules depuis l'API
  getVehicules(): Observable<Vehicules[]> {
    return this.http.get<Vehicules[]>(this.apiUrl);
  }

  loadVehicules() {
    this.getVehicules().subscribe({
      next: data => {
        this.vehicules.set(data);
        console.log('Véhicules chargés :', data);
      },
      error: err => {
        console.error('Erreur API', err);
      }
    });
  }

  // Filtered vehicules selon la recherche
  filteredVehicules = computed(() => {
    const query = this.searchQuery().toLowerCase();

    if (!query) return this.vehicules();

    return this.vehicules().filter(v =>
      v.immatriculation?.toLowerCase().includes(query) ||
      v.marque?.toLowerCase().includes(query) ||
      v.modele?.toLowerCase().includes(query) ||
      v.typeVehicule?.toLowerCase().includes(query)
    );
  });

  // Statistiques basiques
  stats = computed(() => ({
    total: this.vehicules().length,
    actifs: this.vehicules().filter(v => v.statut === 'actif').length,
    maintenance: this.vehicules().filter(v => v.statut === 'en_maintenance').length,
    enPanne: this.vehicules().filter(v => v.statut === 'en_panne').length,
    retires: this.vehicules().filter(v => v.statut === 'retire').length
  }));

  // CRUD operations

  addVehicule(vehicule: Omit<Vehicules, 'id'>): Observable<Vehicules> {
    return this.http.post<Vehicules>(this.apiUrl, vehicule).pipe(
      tap(newVehicule => this.vehicules.update(list => [...list, newVehicule]))
    );
  }

  updateVehicule(id: number, vehicule: Partial<Vehicules>): Observable<Vehicules> {
    return this.http.put<Vehicules>(`${this.apiUrl}/${id}`, vehicule).pipe(
      tap(updated => this.vehicules.update(list =>
        list.map(v => v.id === id ? updated : v)
      ))
    );
  }

  deleteVehicule(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        console.log(`Véhicule ${id} supprimé avec succès`);
        this.vehicules.update(list => list.filter(v => v.id !== id));
      },
      error: err => {
        console.error('Erreur lors de la suppression du véhicule :', err);
      }
    });
  }
}
