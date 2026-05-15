import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ChauffeurService } from './chauffeur.service';
import { Chauffeur } from '../Modeles/chauffeur';

describe('ChauffeurService', () => {
  let service: ChauffeurService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8080/api/chauffeurs';

  // Données de test
  const mockChauffeur: Chauffeur = {
    id: 1,
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@example.com',
    telephone: '0600000000',
    password: 'password123',
    statut: 'ACTIF',
    dateCreation: '2024-01-15T10:30:00',
    derniereConnexion: '2024-01-20T14:20:00',
    adresse: '123 rue de la Paix',
    role: null,
    numeroPermis: 'AB123456',
    categoriePermis: 'B',
    dateExpirationPermis: '2026-05-14',
    disponible: true,
    site: 'Paris',
    experienceAnnees: 5
  };

  const mockChauffeurs: Chauffeur[] = [
    mockChauffeur,
    {
      ...mockChauffeur,
      id: 2,
      nom: 'Martin',
      prenom: 'Pierre',
      email: 'pierre.martin@example.com'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ChauffeurService]
    });

    service = TestBed.inject(ChauffeurService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ─── Tests basiques ───────────────────────────────────────────────────
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with empty signals', () => {
    expect(service.chauffeurs()).toEqual([]);
    expect(service.searchQuery()).toBe('');
    expect(service.isLoading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  // ─── Tests de lecture ────────────────────────────────────────────────
  describe('getChauffeurs()', () => {
    it('should fetch all chauffeurs and update signal', (done) => {
      service.getChauffeurs().subscribe({
        next: (chauffeurs) => {
          expect(chauffeurs).toEqual(mockChauffeurs);
          expect(service.chauffeurs()).toEqual(mockChauffeurs);
          done();
        }
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockChauffeurs);
    });

    it('should handle 500 error', (done) => {
      service.getChauffeurs().subscribe({
        error: (error) => {
          expect(error).toBeDefined();
          expect(service.error()).toContain('Erreur');
          done();
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getChauffeurById()', () => {
    it('should fetch a single chauffeur', (done) => {
      service.getChauffeurById(1).subscribe({
        next: (chauffeur) => {
          expect(chauffeur).toEqual(mockChauffeur);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockChauffeur);
    });
  });

  // ─── Tests de création ────────────────────────────────────────────────
  describe('addChauffeur()', () => {
    it('should create a new chauffeur and update signal', (done) => {
      const newChauffeur = { ...mockChauffeur };
      delete (newChauffeur as any).id;
      delete (newChauffeur as any).dateCreation;

      service.addChauffeur(newChauffeur as any).subscribe({
        next: (chauffeur) => {
          expect(chauffeur.id).toBe(mockChauffeur.id);
          expect(service.chauffeurs()).toContain(chauffeur);
          done();
        }
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      req.flush(mockChauffeur);
    });
  });

  // ─── Tests de mise à jour ──────────────────────────────────────────────
  describe('updateChauffeur()', () => {
    it('should update a chauffeur', (done) => {
      const id = 1;
      const updateData = { ...mockChauffeur, experienceAnnees: 10 };

      service.updateChauffeur(id, updateData).subscribe({
        next: (chauffeur) => {
          expect(chauffeur.experienceAnnees).toBe(10);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      expect(req.request.method).toBe('PUT');
      req.flush(updateData);
    });
  });

  // ─── Tests de suppression ──────────────────────────────────────────────
  describe('deleteChauffeur()', () => {
    it('should delete a chauffeur and update signal', (done) => {
      const id = 1;
      service.chauffeurs.set([mockChauffeur]);

      service.deleteChauffeur(id).subscribe({
        next: () => {
          expect(service.chauffeurs().length).toBe(0);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  // ─── Tests des computed values ────────────────────────────────────────
  describe('Computed values', () => {
    it('should filter chauffeurs by search query', () => {
      service.chauffeurs.set(mockChauffeurs);

      service.searchQuery.set('Dupont');
      expect(service.filteredChauffeurs().length).toBe(1);

      service.searchQuery.set('');
      expect(service.filteredChauffeurs().length).toBe(2);
    });

    it('should calculate stats correctly', () => {
      service.chauffeurs.set(mockChauffeurs);
      const stats = service.stats();
      
      expect(stats.total).toBe(2);
      expect(stats.actifs).toBeGreaterThan(0);
    });
  });
});
