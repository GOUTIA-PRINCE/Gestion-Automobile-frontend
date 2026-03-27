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
