import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaintenanceService } from '../../services/maintenance.service';
import { VehiculesService } from '../../services/vehicules.service';
import { Vehicules } from '../../Modeles/vehicules';
import { Entretien } from '../../Modeles/maintenance';
import { UtilisateurService } from '../../services/utilisateur.service';
import { Utilisateur } from '../../Modeles/utilisateur';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-maintenance',
  imports: [CommonModule, FormsModule],
  templateUrl: './maintenance.component.html',
  styleUrl: './maintenance.component.css'
})
export class MaintenanceComponent {

 private maintenanceService = inject(MaintenanceService);
 private vehiculesService = inject(VehiculesService);
 private utilisateurService = inject(UtilisateurService);
 private authService = inject(AuthService);

  // Signals
  entretiens = this.maintenanceService.entretiens;
  filtreStatut = this.maintenanceService.filtreStatut;
  searchQuery = this.maintenanceService.searchQuery;
  isLoading = signal(false);
  isFormOpen = signal(false);
  selectedEntretien = signal<any>(null);
  vehicules = signal<Vehicules[]>([]);
  maintenanciers = signal<Utilisateur[]>([]);
  formData: Partial<Entretien> = this.createEmptyForm();

  // Computed
  filteredEntretiens = computed(() => this.maintenanceService.getFilteredEntretiens());
  stats = computed(() => this.maintenanceService.getStats());
  statutsCount = computed(() => this.maintenanceService.getStatutsCount());

  get canWrite(): boolean {
    return this.authService.hasPermission('maintenance:write');
  }
  
  urgenceStats = computed(() => {
  const entretiens = this.entretiens();
  return {
    elevee: entretiens.filter(e => e.urgence === 'elevee').length,
    moyenne: entretiens.filter(e => e.urgence === 'moyenne').length,
    faible: entretiens.filter(e => e.urgence === 'faible').length
  };
});
  
  // Ajoutez cette computed pour les entretiens planifiés
  prochainsEntretiensPlanifies = computed(() => {
    return this.entretiens().filter(e => e.statut === 'planifie').slice(0, 3);
  });

  constructor() {
    this.vehiculesService.getVehicules().subscribe({
      next: data => this.vehicules.set(data),
      error: err => console.error('Erreur chargement vehicules', err)
    });
    this.maintenanciers.set(
      this.utilisateurService.utilisateurs().filter(u => u.typeUtilisateur === 'MAINTENANCIER')
    );
    this.utilisateurService.loadUtilisateurs();
    setTimeout(() => {
      this.maintenanciers.set(
        this.utilisateurService.utilisateurs().filter(u => u.typeUtilisateur === 'MAINTENANCIER')
      );
    }, 300);
  }

  // Actions
  handleAdd(): void {
    this.selectedEntretien.set(null);
    this.formData = this.createEmptyForm();
    this.isFormOpen.set(true);
  }

  handleEdit(entretien: any): void {
    this.selectedEntretien.set(entretien);
    this.formData = { ...entretien };
    this.isFormOpen.set(true);
  }

  handleSubmit(): void {
    const vehicule = this.vehicules().find(v => v.id === Number(this.formData.vehiculeId));
    const maintenancier = this.maintenanciers().find(m => m.id === Number(this.formData.maintenancierId));
    if (!vehicule || !this.formData.type || !this.formData.titre || !this.formData.datePlanifiee) {
      alert('Veuillez renseigner le vehicule, le type, le titre et la date');
      return;
    }

    const entretien: Omit<Entretien, 'id'> = {
      vehiculeId: vehicule.id,
      vehiculeImmatriculation: vehicule.immatriculation,
      vehiculeMarque: vehicule.marque,
      vehiculeModele: vehicule.modele,
      maintenancierId: maintenancier?.id,
      maintenancierNom: maintenancier ? `${maintenancier.prenom} ${maintenancier.nom}` : undefined,
      type: this.formData.type,
      titre: this.formData.titre,
      description: this.formData.description || '',
      datePlanifiee: new Date(this.formData.datePlanifiee),
      dateDebut: this.formData.dateDebut ? new Date(this.formData.dateDebut) : undefined,
      dateFin: this.formData.dateFin ? new Date(this.formData.dateFin) : undefined,
      statut: this.formData.statut || 'planifie',
      coutEstime: Number(this.formData.coutEstime || 0),
      coutReel: this.formData.coutReel ? Number(this.formData.coutReel) : undefined,
      kilometrageVehicule: Number(this.formData.kilometrageVehicule || vehicule.kilometrage || 0),
      prochainEntretienKm: this.formData.prochainEntretienKm ? Number(this.formData.prochainEntretienKm) : undefined,
      fournisseur: this.formData.fournisseur,
      notes: this.formData.notes,
      urgence: this.formData.urgence || 'moyenne'
    };

    const selected = this.selectedEntretien();
    if (selected) {
      this.maintenanceService.updateEntretien(selected.id, entretien);
    } else {
      this.maintenanceService.addEntretien(entretien);
    }
    this.isFormOpen.set(false);
  }

  handleDelete(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet entretien ?')) {
      this.maintenanceService.deleteEntretien(id);
    }
  }

  // Helpers
  formatDate(date: Date): string {
    const d = new Date(date);
    const mois = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    return `${d.getDate()} ${mois[d.getMonth()]}. ${d.getFullYear()}`;
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  }

  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'planifie': 'Planifié',
      'en_cours': 'En cours',
      'termine': 'Terminé',
      'annule': 'Annulé'
    };
    return labels[statut] || statut;
  }

  getUrgenceClass(urgence: string): string {
    const classes: { [key: string]: string } = {
      'faible': 'border-success text-success',
      'moyenne': 'border-warning text-warning',
      'elevee': 'border-danger text-danger'
    };
    return classes[urgence] || '';
  }

  getUrgenceIcon(urgence: string): string {
    const icons: { [key: string]: string } = {
      'faible': 'bi-check-circle',
      'moyenne': 'bi-exclamation-triangle',
      'elevee': 'bi-exclamation-octagon'
    };
    return icons[urgence] || 'bi-exclamation';
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  private createEmptyForm(): Partial<Entretien> {
    return {
      vehiculeId: undefined,
      type: 'vidange',
      titre: '',
      description: '',
      datePlanifiee: new Date(),
      statut: 'planifie',
      coutEstime: 0,
      kilometrageVehicule: 0,
      urgence: 'moyenne'
    };
  }
}
