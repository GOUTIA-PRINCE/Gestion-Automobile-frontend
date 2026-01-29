import { CommonModule } from '@angular/common';
import { Component,signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chauffeur } from '../../Modeles/chauffeur';
import { ChauffeurService } from '../../services/chauffeur.service';

@Component({
  selector: 'app-chauffeurs',
  imports: [CommonModule, FormsModule],
  templateUrl: './chauffeurs.component.html',
  styleUrl: './chauffeurs.component.css'
})
export class ChauffeursComponent {

  private chauffeurService = inject(ChauffeurService);

  // Signals
  chauffeurs = this.chauffeurService.chauffeurs;
  searchQuery = this.chauffeurService.searchQuery;
  isLoading = signal(false);
  canManage = true;
  isFormOpen = signal(false);
  selectedChauffeur = signal<Chauffeur | null>(null);

  // Computed
  filteredChauffeurs = computed(() => this.chauffeurService.getFilteredChauffeurs());
  stats = computed(() => ({
    total: this.chauffeurs().length,
    actifs: this.chauffeurs().filter(c => c.statut === 'actif').length,
    mission: this.chauffeurs().filter(c => c.statut === 'mission').length,
    conge: this.chauffeurs().filter(c => c.statut === 'congé').length,
    inactifs: this.chauffeurs().filter(c => c.statut === 'inactif').length
  }));

  // Actions
  handleAdd(): void {
    this.selectedChauffeur.set(null);
    this.isFormOpen.set(true);
  }

  handleEdit(chauffeur: Chauffeur): void {
    this.selectedChauffeur.set(chauffeur);
    this.isFormOpen.set(true);
  }

  handleDelete(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce chauffeur ?')) {
      this.chauffeurService.deleteChauffeur(id);
    }
  }

  // TrackBy
  trackByChauffeurId(index: number, chauffeur: Chauffeur): number {
    return chauffeur.id;
  }

  // Helper pour obtenir les initiales
  getInitials(nom: string, prenom: string): string {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  }

  // Formatter la date
  formatDate(dateStr: string): string {
    const [day, month, year] = dateStr.split('/');
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 
                   'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    return `${day} ${months[parseInt(month) - 1]} ${year}`;
  }

}
