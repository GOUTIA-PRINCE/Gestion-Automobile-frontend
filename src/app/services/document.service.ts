import { Injectable, signal } from '@angular/core';
import { Document } from '../Modeles/ducument';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private documentsData: Document[] = [
    {
      id: 1,
      type: 'assurance',
      titre: 'Contrat d\'assurance Toyota Hilux',
      description: 'Contrat d\'assurance tous risques',
      vehiculeId: 1,
      vehiculeImmatriculation: 'LT 1234 A',
      vehiculeMarque: 'Toyota',
      vehiculeModele: 'Hilux',
      dateCreation: new Date('2023-12-15'),
      dateExpiration: new Date('2024-12-15'),
      dateMaj: new Date('2024-01-10'),
      taille: 2450,
      extension: 'pdf',
      cheminFichier: '/documents/assurance-toyota-2024.pdf',
      statut: 'valide',
      categorie: 'vehicule',
      tags: ['assurance', 'tous risques', '2024']
    },
    {
      id: 2,
      type: 'carte_grise',
      titre: 'Carte grise Mitsubishi L200',
      description: 'Certificat d\'immatriculation original',
      vehiculeId: 2,
      vehiculeImmatriculation: 'CE 5678 B',
      vehiculeMarque: 'Mitsubishi',
      vehiculeModele: 'L200',
      dateCreation: new Date('2021-06-20'),
      dateExpiration: new Date('2026-06-20'),
      dateMaj: new Date('2023-05-15'),
      taille: 1800,
      extension: 'pdf',
      cheminFichier: '/documents/carte-grise-mitsubishi.pdf',
      statut: 'valide',
      categorie: 'vehicule',
      tags: ['carte grise', 'immatriculation']
    },
    {
      id: 3,
      type: 'contrat',
      titre: 'Contrat de travail Jean-Pierre Nguema',
      description: 'Contrat CDI chauffeur',
      chauffeurId: 1,
      chauffeurNom: 'Jean-Pierre Nguema',
      dateCreation: new Date('2019-03-01'),
      dateMaj: new Date('2023-12-01'),
      taille: 3200,
      extension: 'pdf',
      cheminFichier: '/documents/contrat-nguema.pdf',
      statut: 'valide',
      categorie: 'chauffeur',
      tags: ['contrat', 'CDI', 'chauffeur']
    },
    {
      id: 4,
      type: 'facture',
      titre: 'Facture maintenance janvier 2024',
      description: 'Révision complète 60 000 km',
      vehiculeId: 2,
      vehiculeImmatriculation: 'CE 5678 B',
      dateCreation: new Date('2024-01-18'),
      dateMaj: new Date('2024-01-18'),
      taille: 1250,
      extension: 'pdf',
      cheminFichier: '/documents/facture-maintenance-012024.pdf',
      statut: 'valide',
      categorie: 'financier',
      tags: ['facture', 'maintenance', 'révision']
    },
    {
      id: 5,
      type: 'maintenance',
      titre: 'Carnet d\'entretien Ford Ranger',
      description: 'Historique complet des entretiens',
      vehiculeId: 4,
      vehiculeImmatriculation: 'CE 3456 D',
      vehiculeMarque: 'Ford',
      vehiculeModele: 'Ranger',
      dateCreation: new Date('2020-01-15'),
      dateMaj: new Date('2023-11-30'),
      taille: 4500,
      extension: 'pdf',
      cheminFichier: '/documents/carnet-entretien-ford.pdf',
      statut: 'valide',
      categorie: 'vehicule',
      tags: ['entretien', 'historique', 'maintenance']
    },
    {
      id: 6,
      type: 'permis',
      titre: 'Permis de conduire Marie Fotso',
      description: 'Permis B valide',
      chauffeurId: 2,
      chauffeurNom: 'Marie Fotso',
      dateCreation: new Date('2018-01-10'),
      dateExpiration: new Date('2028-01-10'),
      dateMaj: new Date('2023-06-15'),
      taille: 2100,
      extension: 'jpg',
      cheminFichier: '/documents/permis-fotso.jpg',
      statut: 'expirant',
      categorie: 'chauffeur',
      tags: ['permis', 'conduire', 'copie']
    },
    {
      id: 7,
      type: 'assurance',
      titre: 'Assurance Ford Ranger',
      description: 'Assurance expirant bientôt',
      vehiculeId: 4,
      vehiculeImmatriculation: 'CE 3456 D',
      dateCreation: new Date('2023-01-25'),
      dateExpiration: new Date('2024-01-25'),
      dateMaj: new Date('2023-01-25'),
      taille: 2300,
      extension: 'pdf',
      cheminFichier: '/documents/assurance-ford.pdf',
      statut: 'expirant',
      categorie: 'vehicule',
      tags: ['assurance', 'expiration']
    },
    {
      id: 8,
      type: 'autre',
      titre: 'Rapport d\'audit parc automobile',
      description: 'Audit annuel du parc',
      dateCreation: new Date('2023-12-10'),
      dateMaj: new Date('2023-12-10'),
      taille: 5800,
      extension: 'pdf',
      cheminFichier: '/documents/rapport-audit-2023.pdf',
      statut: 'valide',
      categorie: 'administratif',
      tags: ['rapport', 'audit', 'annuel']
    }
  ];

  documents = signal<Document[]>(this.documentsData);
  filtreType = signal<string>('tous');
  filtreCategorie = signal<string>('tous');
  searchQuery = signal('');

  constructor() {}

  getFilteredDocuments() {
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
        d.titre.toLowerCase().includes(query) ||
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
    const expires = documents.filter(d => 
      d.dateExpiration && d.dateExpiration < maintenant
    ).length;
    
    const tailleTotale = documents.reduce((sum, d) => sum + d.taille, 0);

    return { total, valides, expirant, expires, tailleTotale };
  }

  addDocument(document: Omit<Document, 'id'>) {
    const newId = Math.max(...this.documents().map(d => d.id)) + 1;
    const newDocument: Document = { ...document, id: newId };
    this.documents.update(list => [...list, newDocument]);
  }

  updateDocument(id: number, updatedDocument: Partial<Document>) {
    this.documents.update(list =>
      list.map(document =>
        document.id === id ? { ...document, ...updatedDocument } : document
      )
    );
  }

  deleteDocument(id: number) {
    this.documents.update(list => list.filter(document => document.id !== id));
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
    if (tailleKo < 1024) {
      return `${tailleKo} Ko`;
    } else {
      return `${(tailleKo / 1024).toFixed(1)} Mo`;
    }
  }

  getJoursRestants(dateExpiration?: Date): number | null {
    if (!dateExpiration) return null;
    const maintenant = new Date();
    const expiration = new Date(dateExpiration);
    const diff = expiration.getTime() - maintenant.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }
}