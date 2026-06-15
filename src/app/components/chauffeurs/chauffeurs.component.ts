import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chauffeur } from '../../Modeles/chauffeur';
import { ChauffeurService } from '../../services/chauffeur.service';
import { Vehicules } from '../../Modeles/vehicules';
import { VehiculesService } from '../../services/vehicules.service';

// Constants
const PERMIS_CATEGORIES = ['A', 'A1', 'B', 'B1', 'C', 'C1', 'D', 'D1', 'E'];
const SITES_DISPONIBLES = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Bordeaux', 'Strasbourg', 'Montpellier', 'Nantes', 'Autres'];
const MAX_PHOTO_SIZE_BYTES = 1_000_000;

interface FormData extends Partial<Chauffeur> {
  vehiculeAttribue?: { id?: number; marque: string; modele: string; immatriculation: string };
  photoProfile?: string;
}

@Component({
  selector: 'app-chauffeurs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chauffeurs.component.html',
  styleUrls: ['./chauffeurs.component.css']
})
export class ChauffeursComponent implements OnInit {

  // ─── Services ──────────────────────────────────────────────────────────
  private chauffeurService = inject(ChauffeurService);
  private vehiculesService = inject(VehiculesService);

  // ─── Signals partagés avec le service ──────────────────────────────────
  chauffeurs = this.chauffeurService.chauffeurs;
  filteredChauffeurs = this.chauffeurService.filteredChauffeurs;
  stats = this.chauffeurService.stats;
  isServiceLoading = this.chauffeurService.isLoading;
  serviceError = this.chauffeurService.error;

  // ─── Getter/Setter pour searchQuery (réactivité avec ngModel) ───────────
  get searchQuery(): string {
    return this.chauffeurService.searchQuery();
  }

  set searchQuery(value: string) {
    this.chauffeurService.searchQuery.set(value);
  }

  // ─── États locaux du composant ──────────────────────────────────────────
  vehicules = signal<Vehicules[]>([]);
  isLoading = signal(false);
  isFormOpen = signal(false);
  selectedChauffeur = signal<Chauffeur | null>(null);
  
  // ─── Stepper states ─────────────────────────────────────────────────────
  currentStep = signal<'photo' | 'perso' | 'permis' | 'pro' | 'vehicule'>('photo');
  
  stepCompletionStatus = signal({
    photo: false,
    perso: false,
    permis: false,
    pro: false,
    vehicule: true
  });

  // ─── Constants for templates ────────────────────────────────────────────
  readonly PERMIS_CATEGORIES = PERMIS_CATEGORIES;
  readonly SITES_DISPONIBLES = SITES_DISPONIBLES;
  
  canManage = true;

  availableVehicules = computed(() => {
    const selectedId = this.selectedChauffeur()?.id;
    return this.vehicules().filter(v =>
      v.statut === 'actif' && (!v.chauffeurId || v.chauffeurId === selectedId)
    );
  });

  // ─── Données du formulaire ──────────────────────────────────────────────
  formData: FormData = this.createEmptyForm();

  // ─── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Charge les données (chauffeurs et véhicules)
   */
  private loadData(): void {
    this.isLoading.set(true);
    this.chauffeurService.loadChauffeurs();

    this.vehiculesService.getVehicules().subscribe({
      next: (data) => {
        this.vehicules.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur récupération véhicules :', err);
        this.isLoading.set(false);
      }
    });
  }

  // ─── Actions du formulaire ──────────────────────────────────────────────

  /**
   * Ouvre le formulaire pour créer un nouveau chauffeur
   */
  handleAdd(): void {
    this.selectedChauffeur.set(null);
    this.formData = this.createEmptyForm();
    this.currentStep.set('photo');
    this.resetStepStatus();
    this.isFormOpen.set(true);
  }

  /**
   * Ouvre le formulaire pour éditer un chauffeur
   */
  handleEdit(chauffeur: Chauffeur): void {
    this.selectedChauffeur.set(chauffeur);
    const vehiculeAttribue = this.vehicules().find(v => v.chauffeurId === chauffeur.id);
    this.formData = {
      ...chauffeur,
      vehiculeAttribue: vehiculeAttribue
        ? {
            id: vehiculeAttribue.id,
            marque: vehiculeAttribue.marque,
            modele: vehiculeAttribue.modele,
            immatriculation: vehiculeAttribue.immatriculation
          }
        : { id: undefined, marque: '', modele: '', immatriculation: '' }
    };
    this.currentStep.set('photo');
    this.resetStepStatus();
    this.isFormOpen.set(true);
  }

  /**
   * Supprime un chauffeur après confirmation
   */
  handleDelete(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce chauffeur ?')) {
      this.chauffeurService.deleteChauffeur(id).subscribe({
        next: (chauffeur) => {
          console.log('Chauffeur supprimé avec succès');
        },
        error: (err) => {
          console.error('Erreur suppression chauffeur :', err);
          alert('Erreur lors de la suppression du chauffeur');
        }
      });
    }
  }

  // ─── Stepper navigation ─────────────────────────────────────────────────

  /**
   * Valide l'étape actuelle et passe à la suivante
   */
  nextStep(): void {
    if (this.validateCurrentStep()) {
      const steps: ('photo' | 'perso' | 'permis' | 'pro' | 'vehicule')[] = 
        ['photo', 'perso', 'permis', 'pro', 'vehicule'];
      const currentIndex = steps.indexOf(this.currentStep());
      
      if (currentIndex < steps.length - 1) {
        this.currentStep.set(steps[currentIndex + 1]);
      } else {
        this.handleSubmit();
      }
    }
  }

  /**
   * Retour à l'étape précédente
   */
  previousStep(): void {
    const steps: ('photo' | 'perso' | 'permis' | 'pro' | 'vehicule')[] = 
      ['photo', 'perso', 'permis', 'pro', 'vehicule'];
    const currentIndex = steps.indexOf(this.currentStep());
    
    if (currentIndex > 0) {
      this.currentStep.set(steps[currentIndex - 1]);
    }
  }

  /**
   * Valide l'étape actuelle
   */
  validateCurrentStep(): boolean {
    const step = this.currentStep();
    
    switch (step) {
      case 'photo':
        return true;
        
      case 'perso':
        const hasPersonal = this.formData.nom?.trim() && 
                           this.formData.prenom?.trim() && 
                           this.formData.email?.trim();
        if (!hasPersonal) {
          alert('Veuillez remplir: Nom, Prénom, Email');
          return false;
        }
        this.updateStepStatus('perso', true);
        return true;
        
      case 'permis':
        const hasPermis = this.formData.numeroPermis?.trim() && 
                         this.formData.categoriePermis && 
                         this.formData.dateExpirationPermis;
        if (!hasPermis) {
          alert('Veuillez remplir tous les champs du permis');
          return false;
        }
        this.updateStepStatus('permis', true);
        return true;
        
      case 'pro':
        this.updateStepStatus('pro', true);
        return true;
        
      case 'vehicule':
        return true;
        
      default:
        return false;
    }
  }

  /**
   * Met à jour le statut de complétion d'une étape
   */
  updateStepStatus(step: string, completed: boolean): void {
    const status = this.stepCompletionStatus();
    this.stepCompletionStatus.set({
      ...status,
      [step]: completed
    });
  }

  /**
   * Réinitialise le statut de toutes les étapes
   */
  resetStepStatus(): void {
    this.stepCompletionStatus.set({
      photo: false,
      perso: false,
      permis: false,
      pro: false,
      vehicule: true
    });
  }

  // ─── Upload Photo ──────────────────────────────────────────────────────

  /**
   * Gère le changement de fichier photo
   */
  onPhotoSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Veuillez choisir un fichier image valide');
        event.target.value = '';
        return;
      }

      if (file.size > MAX_PHOTO_SIZE_BYTES) {
        alert('La photo est trop lourde. Choisissez une image de moins de 1 Mo.');
        event.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.formData.photoProfile = e.target.result;
        this.formData.photoMimeType = file.type;
        this.formData.photoData = this.extractBase64Data(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Valide et soumet le formulaire (création ou modification)
   */
  handleSubmit(): void {
    if (!this.formData.nom?.trim() || !this.formData.prenom?.trim() || !this.formData.email?.trim()) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }

    const email = this.formData.email.trim().toLowerCase();
    const emailAlreadyExists = this.chauffeurs().some(c =>
      c.email?.toLowerCase() === email && c.id !== this.selectedChauffeur()?.id
    );

    if (emailAlreadyExists) {
      alert('Cet email existe deja. Utilisez un email different.');
      return;
    }

    if (!this.formData.dateExpirationPermis) {
      alert('Veuillez renseigner la date d expiration du permis');
      return;
    }

    const chauffeurData: Omit<Chauffeur, 'id' | 'dateCreation'> = {
      nom: this.formData.nom.trim(),
      prenom: this.formData.prenom.trim(),
      email,
      telephone: this.formData.telephone || '',
      adresse: this.formData.adresse || '',
      password: this.formData.password || '',
      statut: this.formData.statut || 'ACTIF',
      derniereConnexion: this.formData.derniereConnexion,
      role: this.formData.role,
      
      numeroPermis: this.formData.numeroPermis || '',
      categoriePermis: this.formData.categoriePermis || '',
      dateExpirationPermis: this.formData.dateExpirationPermis || '',
      disponible: this.formData.disponible ?? true,
      site: this.formData.site || '',
      experienceAnnees: this.formData.experienceAnnees ?? 0,
      photoData: this.formData.photoData,
      photoMimeType: this.formData.photoMimeType
    };

    if (this.selectedChauffeur()) {
      const id = this.selectedChauffeur()!.id;
      this.chauffeurService.updateChauffeur(id, chauffeurData as Chauffeur).subscribe({
        next: (chauffeur) => {
          console.log('Chauffeur mis à jour avec succès');
          this.syncVehiculeAffectation(chauffeur);
          this.closeForm();
        },
        error: (err) => {
          console.error('Erreur mise à jour chauffeur :', err);
          alert('Erreur lors de la mise à jour du chauffeur');
        }
      });
    } else {
      this.chauffeurService.addChauffeur(chauffeurData).subscribe({
        next: (chauffeur) => {
          console.log('Chauffeur créé avec succès');
          this.syncVehiculeAffectation(chauffeur);
          this.closeForm();
        },
        error: (err) => {
          console.error('Erreur création chauffeur :', err);
          alert('Erreur lors de la création du chauffeur');
        }
      });
    }
  }

  /**
   * Gère la sélection d'un véhicule dans le formulaire
   */
  private syncVehiculeAffectation(chauffeur: Chauffeur): void {
    const vehiculeId = this.formData.vehiculeAttribue?.id;
    if (!vehiculeId) {
      return;
    }

    const vehicule = this.vehicules().find(v => v.id === vehiculeId);
    if (!vehicule) {
      return;
    }

    this.vehiculesService.updateVehicule(vehiculeId, {
      ...vehicule,
      chauffeurId: chauffeur.id
    }).subscribe({
      next: updated => this.vehicules.update(list => list.map(v => v.id === updated.id ? updated : v)),
      error: err => console.error('Erreur attribution vehicule', err)
    });
  }

  onVehiculeSelect(id?: number | string): void {
    const vehiculeId = Number(id);

    if (!vehiculeId) {
      this.formData.vehiculeAttribue = { 
        id: undefined, 
        marque: '', 
        modele: '', 
        immatriculation: '' 
      };
      return;
    }

    const selected = this.vehicules().find((v: Vehicules) => v.id === vehiculeId);
    if (selected) {
      this.formData.vehiculeAttribue = {
        id: selected.id,
        marque: selected.marque,
        modele: selected.modele,
        immatriculation: selected.immatriculation
      };
    } else {
      this.formData.vehiculeAttribue = { 
        id: undefined, 
        marque: '', 
        modele: '', 
        immatriculation: '' 
      };
    }
  }

  /**
   * Ferme le formulaire et réinitialise les données
   */
  closeForm(): void {
    this.isFormOpen.set(false);
    this.formData = this.createEmptyForm();
    this.selectedChauffeur.set(null);
    this.currentStep.set('photo');
    this.resetStepStatus();
  }

  /**
   * Crée un formulaire vide avec les valeurs par défaut
   */
  createEmptyForm(): FormData {
    return {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: '',
      password: '',
      statut: 'ACTIF',
      
      numeroPermis: '',
      categoriePermis: '',
      dateExpirationPermis: '',
      disponible: true,
      site: '',
      experienceAnnees: 0,
      
      photoProfile: '',
      photoData: undefined,
      photoMimeType: undefined,
      vehiculeAttribue: { id: undefined, marque: '', modele: '', immatriculation: '' }
    };
  }

  // ─── Helpers ────────────────────────────────────────────────────────────

  /**
   * TrackBy function pour les listes ngFor
   */
  trackByChauffeurId(index: number, chauffeur: Chauffeur): number {
    return chauffeur.id;
  }

  /**
   * Génère les initiales d'un chauffeur
   */
  getInitials(nom: string, prenom: string): string {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  }

  /**
   * Formate une date
   */
  formatDate(date: string | undefined): string {
    if (!date) return '—';
    try {
      return new Date(date).toLocaleDateString('fr-FR');
    } catch {
      return date;
    }
  }

  /**
   * Formate le statut du chauffeur
   */
  formatStatut(statut: string): string {
    const statusMap: { [key: string]: string } = {
      'ACTIF': 'Actif',
      'INACTIF': 'Inactif',
      'EN_CONGE': 'En congé',
      'MISSION': 'En mission'
    };
    return statusMap[statut] || statut;
  }

  /**
   * Vérifie si le permis est expiré
   */
  isPermisExpire(dateExpiration: string | undefined): boolean {
    if (!dateExpiration) return false;
    return new Date(dateExpiration) < new Date();
  }

  /**
   * Retourne l'index de l'étape actuelle pour la progress bar
   */
  getCurrentStepIndex(): number {
    const steps: ('photo' | 'perso' | 'permis' | 'pro' | 'vehicule')[] = 
      ['photo', 'perso', 'permis', 'pro', 'vehicule'];
    return steps.indexOf(this.currentStep());
  }

  private extractBase64Data(dataUrl: string): string {
    return dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  }
}
