import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chauffeur } from '../../Modeles/chauffeur';
import { ChauffeurService } from '../../services/chauffeur.service';

@Component({
  selector: 'app-chauffeurs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chauffeurs.component.html',
  styleUrls: ['./chauffeurs.component.css']
})
export class ChauffeursComponent implements OnInit {

  // Services
  private chauffeurService = inject(ChauffeurService);

  // Signals partagés avec le service
  chauffeurs = this.chauffeurService.chauffeurs;
  searchQuery = this.chauffeurService.searchQuery;
  filteredChauffeurs = this.chauffeurService.filteredChauffeurs;
  stats = this.chauffeurService.stats;

  // États locaux
  isLoading = signal(false);
  isFormOpen = signal(false);
  selectedChauffeur = signal<Chauffeur | null>(null);
  canManage = true;

  formData: Partial<Chauffeur> & { vehiculeAttribue: { marque: string; modele: string; immatriculation: string } } = this.createEmptyForm();

  ngOnInit(): void {
    this.isLoading.set(true);
    this.chauffeurService.getChauffeurs().subscribe({
      next: data => {
        this.chauffeurs.set(data);
        console.log('Chauffeurs récupérés :', data);
        this.isLoading.set(false);
      },
      error: err => {
        console.error('Erreur API', err);
        this.isLoading.set(false);
      }
    });
  }

  // ACTIONS
  handleAdd(): void {
    this.selectedChauffeur.set(null);
    this.formData = this.createEmptyForm();
    this.isFormOpen.set(true);
  }

  handleEdit(chauffeur: Chauffeur): void {
    this.selectedChauffeur.set(chauffeur);
    this.formData = {
      ...chauffeur,
      vehiculeAttribue: chauffeur.vehiculeAttribue ? { ...chauffeur.vehiculeAttribue } : { marque: '', modele: '', immatriculation: '' }
    };
    this.isFormOpen.set(true);
  }

  handleDelete(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce chauffeur ?')) {
      this.chauffeurService.deleteChauffeur(id);
    }
  }

  handleSubmit(): void {
    const payload: Omit<Chauffeur, 'id'> = {
      nom: this.formData.nom?.trim() || '',
      prenom: this.formData.prenom?.trim() || '',
      telephone: this.formData.telephone || '',
      email: this.formData.email || '',
      numeroPermis: this.formData.numeroPermis || '',
      dateEmbauche: this.formData.dateEmbauche || '',
      statut: this.formData.statut || 'actif',
      photoUrl: this.formData.photoUrl || '',
      dateNaissance: this.formData.dateNaissance || '',
      adresse: this.formData.adresse || '',
      experience: this.formData.experience ?? 0,
      vehiculeAttribue: this.formData.vehiculeAttribue?.marque || this.formData.vehiculeAttribue?.modele || this.formData.vehiculeAttribue?.immatriculation
        ? {
            marque: this.formData.vehiculeAttribue?.marque || '',
            modele: this.formData.vehiculeAttribue?.modele || '',
            immatriculation: this.formData.vehiculeAttribue?.immatriculation || ''
          }
        : undefined
    };

    if (this.selectedChauffeur()) {
      const id = this.selectedChauffeur()!.id;
      this.chauffeurService.updateChauffeur(id, { ...(payload as Chauffeur), id });
    } else {
      this.chauffeurService.addChauffeur(payload);
    }

    this.closeForm();
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.formData = this.createEmptyForm();
    this.selectedChauffeur.set(null);
  }

  createEmptyForm(): Partial<Chauffeur> & { vehiculeAttribue: { marque: string; modele: string; immatriculation: string } } {
    return {
      nom: '',
      prenom: '',
      telephone: '',
      email: '',
      numeroPermis: '',
      dateEmbauche: '',
      statut: 'actif',
      photoUrl: '',
      dateNaissance: '',
      adresse: '',
      experience: 0,
      vehiculeAttribue: { marque: '', modele: '', immatriculation: '' }
    };
  }

  // TRACK BY
  trackByChauffeurId(index: number, chauffeur: Chauffeur): number {
    return chauffeur.id;
  }

  // HELPER
  getInitials(nom: string, prenom: string): string {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  }

  formatDate(date: string): string {
    return date; // ou formatter selon ton besoin
  }
}
