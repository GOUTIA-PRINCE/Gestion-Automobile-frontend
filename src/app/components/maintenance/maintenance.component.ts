import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaintenanceService } from '../../services/maintenance.service';
@Component({
  selector: 'app-maintenance',
  imports: [CommonModule, FormsModule],
  templateUrl: './maintenance.component.html',
  styleUrl: './maintenance.component.css'
})
export class MaintenanceComponent {

 private maintenanceService = inject(MaintenanceService);

  // Signals
  entretiens = this.maintenanceService.entretiens;
  filtreStatut = this.maintenanceService.filtreStatut;
  searchQuery = this.maintenanceService.searchQuery;
  isLoading = signal(false);
  isFormOpen = signal(false);
  selectedEntretien = signal<any>(null);

  // Computed
  filteredEntretiens = computed(() => this.maintenanceService.getFilteredEntretiens());
  stats = computed(() => this.maintenanceService.getStats());
  statutsCount = computed(() => this.maintenanceService.getStatutsCount());
  
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

  // Actions
  handleAdd(): void {
    this.selectedEntretien.set(null);
    this.isFormOpen.set(true);
  }

  handleEdit(entretien: any): void {
    this.selectedEntretien.set(entretien);
    this.isFormOpen.set(true);
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
}
