import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Document } from '../Modeles/ducument';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private readonly apiUrl = '/api/documents';

  documents = signal<Document[]>([]);
  filtreType = signal<string>('tous');
  filtreCategorie = signal<string>('tous');
  searchQuery = signal('');

  constructor(private http: HttpClient) {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.http.get<Document[]>(this.apiUrl).subscribe({
      next: data => this.documents.set(data.map(d => this.normalizeDocument(d))),
      error: err => console.error('Erreur chargement documents', err)
    });
  }

  getFilteredDocuments(): Document[] {
    const type = this.filtreType();
    const categorie = this.filtreCategorie();
    const query = this.searchQuery().toLowerCase();
    let filtered = this.documents();

    if (type !== 'tous') {
      filtered = filtered.filter(d => d.type === type);
    }

    if (categorie !== 'tous') {
      filtered = filtered.filter(d => d.categorie === categorie);
    }

    if (query) {
      filtered = filtered.filter(d =>
        d.titre?.toLowerCase().includes(query) ||
        d.description?.toLowerCase().includes(query) ||
        d.vehiculeImmatriculation?.toLowerCase().includes(query) ||
        d.vehiculeMarque?.toLowerCase().includes(query) ||
        d.chauffeurNom?.toLowerCase().includes(query) ||
        d.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered.sort((a, b) =>
      new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime()
    );
  }

  getStats() {
    const documents = this.documents();
    const maintenant = new Date();
    const dansUnMois = new Date();
    dansUnMois.setMonth(maintenant.getMonth() + 1);

    const total = documents.length;
    const valides = documents.filter(d => d.statut === 'valide').length;
    const expirant = documents.filter(d =>
      d.dateExpiration &&
      d.dateExpiration <= dansUnMois &&
      d.dateExpiration >= maintenant
    ).length;
    const expires = documents.filter(d => d.dateExpiration && d.dateExpiration < maintenant).length;
    const tailleTotale = documents.reduce((sum, d) => sum + (d.taille || 0), 0);

    return { total, valides, expirant, expires, tailleTotale };
  }

  addDocument(document: Omit<Document, 'id'>): void {
    this.http.post<Document>(this.apiUrl, document).subscribe({
      next: created => this.documents.update(list => [...list, this.normalizeDocument(created)]),
      error: err => console.error('Erreur ajout document', err)
    });
  }

  updateDocument(id: number, updatedDocument: Partial<Document>): void {
    this.http.put<Document>(`${this.apiUrl}/${id}`, updatedDocument).subscribe({
      next: updated => this.documents.update(list =>
        list.map(document => document.id === id ? this.normalizeDocument(updated) : document)
      ),
      error: err => console.error('Erreur modification document', err)
    });
  }

  deleteDocument(id: number): void {
    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
      next: () => this.documents.update(list => list.filter(document => document.id !== id)),
      error: err => console.error('Erreur suppression document', err)
    });
  }

  getTypes() {
    const types = this.documents().map(d => d.type);
    return ['tous', ...new Set(types)];
  }

  getCategories() {
    const categories = this.documents().map(d => d.categorie);
    return ['tous', ...new Set(categories)];
  }

  formatTaille(tailleKo: number): string {
    return tailleKo < 1024 ? `${tailleKo} Ko` : `${(tailleKo / 1024).toFixed(1)} Mo`;
  }

  getJoursRestants(dateExpiration?: Date): number | null {
    if (!dateExpiration) return null;
    const maintenant = new Date();
    const expiration = new Date(dateExpiration);
    const diff = expiration.getTime() - maintenant.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }

  private normalizeDocument(document: Document): Document {
    return {
      ...document,
      dateCreation: new Date(document.dateCreation),
      dateExpiration: document.dateExpiration ? new Date(document.dateExpiration) : undefined,
      dateMaj: document.dateMaj ? new Date(document.dateMaj) : undefined,
      tags: document.tags || []
    };
  }
}
