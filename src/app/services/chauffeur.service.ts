import { Injectable, signal, computed } from '@angular/core';
import { Chauffeur } from '../Modeles/chauffeur';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';

/**
 * Service de gestion des chauffeurs
 * Communique avec l'API backend et maintient l'état local avec les Signals Angular 19
 */
@Injectable({
  providedIn: 'root'
})
export class ChauffeurService {

  private readonly apiUrl = 'http://localhost:8080/api/chauffeurs';

  constructor(private http: HttpClient) {}

  // ─── Signals pour stocker les données ───────────────────────────────────
  chauffeurs = signal<Chauffeur[]>([]);
  searchQuery = signal('');
  isLoading = signal(false);
  error = signal<string | null>(null);

  // ─── Computed Values ───────────────────────────────────────────────────
  /**
   * Filtre les chauffeurs basé sur la recherche
   */
  filteredChauffeurs = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.chauffeurs();

    return this.chauffeurs().filter(c =>
      c.nom?.toLowerCase().includes(query) ||
      c.prenom?.toLowerCase().includes(query) ||
      c.telephone?.includes(query) ||
      c.email?.toLowerCase().includes(query) ||
      c.numeroPermis?.toLowerCase().includes(query) ||
      c.categoriePermis?.toLowerCase().includes(query) ||
      c.site?.toLowerCase().includes(query)
    );
  });

  /**
   * Statistiques sur les chauffeurs
   */
  stats = computed(() => ({
    total: this.chauffeurs().length,
    actifs: this.chauffeurs().filter(c => c.statut === 'ACTIF').length,
    inactifs: this.chauffeurs().filter(c => c.statut !== 'ACTIF').length,
    mission: this.chauffeurs().filter(c => c.statut === 'MISSION').length,
    conge: this.chauffeurs().filter(c => c.statut === 'EN_CONGE').length,
    disponibles: this.chauffeurs().filter(c => c.disponible).length,
  }));

  // ─── Opérations READ ───────────────────────────────────────────────────

  /**
   * Récupère tous les chauffeurs depuis l'API
   */
  getChauffeurs(): Observable<Chauffeur[]> {
    return this.http.get<Chauffeur[]>(this.apiUrl).pipe(
      tap(data => {
        this.chauffeurs.set(data);
        this.error.set(null);
      }),
      catchError(err => this.handleError(err))
    );
  }

  /**
   * Récupère un chauffeur par son ID
   */
  getChauffeurById(id: number): Observable<Chauffeur> {
    return this.http.get<Chauffeur>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => this.handleError(err))
    );
  }

  /**
   * Charge les chauffeurs et met à jour le signal
   */
  loadChauffeurs(): void {
    this.isLoading.set(true);
    this.getChauffeurs().subscribe({
      next: () => this.isLoading.set(false),
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err);
      }
    });
  }

  // ─── Opérations CREATE ─────────────────────────────────────────────────

  /**
   * Crée un nouveau chauffeur
   * @param chauffeur Les données du chauffeur (sans id)
   */
  addChauffeur(chauffeur: Omit<Chauffeur, 'id' | 'dateCreation'>): Observable<Chauffeur> {
    return this.http.post<Chauffeur>(this.apiUrl, chauffeur).pipe(
      tap(newChauffeur => {
        this.chauffeurs.update(list => [...list, newChauffeur]);
        this.error.set(null);
      }),
      catchError(err => this.handleError(err))
    );
  }

  // ─── Opérations UPDATE ────────────────────────────────────────────────

  /**
   * Met à jour un chauffeur existant
   * @param id L'ID du chauffeur
   * @param chauffeur Les données à mettre à jour
   */
  updateChauffeur(id: number, chauffeur: Partial<Chauffeur>): Observable<Chauffeur> {
    return this.http.put<Chauffeur>(`${this.apiUrl}/${id}`, chauffeur).pipe(
      tap(updatedChauffeur => {
        this.chauffeurs.update(list =>
          list.map(c => c.id === id ? updatedChauffeur : c)
        );
        this.error.set(null);
      }),
      catchError(err => this.handleError(err))
    );
  }

  // ─── Opérations DELETE ────────────────────────────────────────────────

  /**
   * Supprime un chauffeur
   * @param id L'ID du chauffeur à supprimer
   */
  deleteChauffeur(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.chauffeurs.update(list => list.filter(c => c.id !== id));
        this.error.set(null);
      }),
      catchError(err => this.handleError(err))
    );
  }

  // ─── Gestion des erreurs ────────────────────────────────────────────────

  /**
   * Gère les erreurs HTTP
   */
  private handleError(error: any) {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Erreur serveur: ${error.status} - ${error.error?.message || 'Veuillez réessayer'}`;
    }
    
    this.error.set(errorMessage);
    console.error(errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
