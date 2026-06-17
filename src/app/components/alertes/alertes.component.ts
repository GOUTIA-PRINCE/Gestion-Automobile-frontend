import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlerteService } from '../../services/alerte.service';

@Component({
  selector: 'app-alertes',
  imports: [CommonModule, FormsModule],
  templateUrl: './alertes.component.html',
  styleUrl: './alertes.component.css'
})
export class AlertesComponent implements OnInit {

  private alerteService = inject(AlerteService);

  // Signals
  alertes = this.alerteService.alertes;
  filtreType = this.alerteService.filtreType;
  filtreStatut = this.alerteService.filtreStatut;
  searchQuery = this.alerteService.searchQuery;
  isLoading = signal(false);

  // Computed
  filteredAlertes = computed(() => this.alerteService.getFilteredAlertes());
  stats = computed(() => this.alerteService.getStats());
  typesOptions = computed(() => this.alerteService.getTypes());
  statutsOptions = computed(() => this.alerteService.getStatuts());
  
  // Computed pour les types filtrés (sans 'tous')
  filteredTypes = computed(() => {
    return this.typesOptions().filter(t => t !== 'tous');
  });
  
  // Computed pour les compteurs par type
  alertesParType = computed(() => {
    const types = this.filteredTypes();
    const alertes = this.alertes();
    
    return types.map(type => ({
      type,
      count: alertes.filter(a => a.type === type).length
    }));
  });

  ngOnInit(): void {
    this.alerteService.loadAlertes();
  }

  // Actions
  handleResoudre(id: number): void {
    if (confirm('Marquer cette alerte comme résolue ?')) {
      this.alerteService.marquerCommeResolue(id);
    }
  }

  handleSupprimer(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) {
      this.alerteService.deleteAlerte(id);
    }
  }

  // Helpers
  formatDate(date: Date): string {
    const d = new Date(date);
    const mois = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    return `${d.getDate()} ${mois[d.getMonth()]}. ${d.getFullYear()}`;
  }

  getJoursRestants(dateEcheance?: Date): number | null {
    if (!dateEcheance) return null;
    const maintenant = new Date();
    const echeance = new Date(dateEcheance);
    const diff = echeance.getTime() - maintenant.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }

  getTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'assurance': 'bi-shield-check',
      'revision': 'bi-tools',
      'carte_grise': 'bi-file-earmark-text',
      'vidange': 'bi-fuel-pump',
      'entretien': 'bi-wrench',
      'pneu': 'bi-circle',
      'controle_technique': 'bi-clipboard-check',
      'permis': 'bi-person-badge',
      'document': 'bi-file-earmark-excel',
      'autre': 'bi-exclamation-triangle'
    };
    return icons[type] || 'bi-exclamation-triangle';
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'assurance': 'Assurance',
      'revision': 'Révision',
      'carte_grise': 'Carte grise',
      'vidange': 'Vidange',
      'entretien': 'Entretien',
      'pneu': 'Pneus',
      'controle_technique': 'Contrôle technique',
      'permis': 'Permis',
      'document': 'Document',
      'autre': 'Autre'
    };
    return labels[type] || type;
  }

  getStatutClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'active': 'bg-warning',
      'resolue': 'bg-success',
      'expiree': 'bg-danger'
    };
    return classes[statut] || 'bg-secondary';
  }

  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'active': 'Active',
      'resolue': 'Résolue',
      'expiree': 'Expirée'
    };
    return labels[statut] || statut;
  }

  getPrioriteClass(priorite: string): string {
    const classes: { [key: string]: string } = {
      'critique': 'border-danger text-danger',
      'haute': 'border-danger text-danger',
      'moyenne': 'border-warning text-warning',
      'basse': 'border-success text-success'
    };
    return classes[priorite] || 'border-secondary text-secondary';
  }

  getPrioriteIcon(priorite: string): string {
    const icons: { [key: string]: string } = {
      'critique': 'bi-exclamation-octagon',
      'haute': 'bi-exclamation-triangle',
      'moyenne': 'bi-exclamation-circle',
      'basse': 'bi-info-circle'
    };
    return icons[priorite] || 'bi-info-circle';
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

}
