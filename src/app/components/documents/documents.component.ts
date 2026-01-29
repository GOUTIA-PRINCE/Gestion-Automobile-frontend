import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../services/document.service';

@Component({
  selector: 'app-documents',
  imports: [CommonModule, FormsModule],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.css'
})
export class DocumentsComponent {

  private documentService = inject(DocumentService);

  // Signals
  documents = this.documentService.documents;
  filtreType = this.documentService.filtreType;
  filtreCategorie = this.documentService.filtreCategorie;
  searchQuery = this.documentService.searchQuery;
  isLoading = signal(false);
  isUploadOpen = signal(false);

  // Computed
  filteredDocuments = computed(() => this.documentService.getFilteredDocuments());
  stats = computed(() => this.documentService.getStats());
  typesOptions = computed(() => this.documentService.getTypes());
  categoriesOptions = computed(() => this.documentService.getCategories());
  
  // Computed pour les documents par catégorie
  documentsParCategorie = computed(() => {
    const categories = this.categoriesOptions().filter(c => c !== 'tous');
    const documents = this.documents();
    
    return categories.map(categorie => ({
      categorie,
      count: documents.filter(d => d.categorie === categorie).length
    }));
  });

  // Computed pour les documents expirants
  documentsExpirants = computed(() => {
    return this.documents().filter(d => d.statut === 'expirant').slice(0, 3);
  });

  // ... le reste de votre code reste inchangé
  handleUpload(): void {
    this.isUploadOpen.set(true);
  }

  handleView(document: any): void {
    console.log('Visualiser document:', document);
    window.open(document.cheminFichier, '_blank');
  }

  handleDownload(document: any): void {
    console.log('Télécharger document:', document);
  }

  handleDelete(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      this.documentService.deleteDocument(id);
    }
  }

  // Helpers
  formatDate(date: Date): string {
    const d = new Date(date);
    const mois = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    return `${d.getDate()} ${mois[d.getMonth()]}. ${d.getFullYear()}`;
  }

  formatTaille(tailleKo: number): string {
    return this.documentService.formatTaille(tailleKo);
  }

  getTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'assurance': 'bi-shield-check',
      'carte_grise': 'bi-file-earmark-text',
      'contrat': 'bi-file-earmark-text-fill',
      'facture': 'bi-receipt',
      'maintenance': 'bi-tools',
      'permis': 'bi-person-badge',
      'autre': 'bi-file-earmark'
    };
    return icons[type] || 'bi-file-earmark';
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'assurance': 'Assurance',
      'carte_grise': 'Carte grise',
      'contrat': 'Contrat',
      'facture': 'Facture',
      'maintenance': 'Maintenance',
      'permis': 'Permis',
      'autre': 'Autre'
    };
    return labels[type] || type;
  }

  getCategorieIcon(categorie: string): string {
    const icons: { [key: string]: string } = {
      'vehicule': 'bi-car-front',
      'chauffeur': 'bi-person-badge',
      'administratif': 'bi-briefcase',
      'financier': 'bi-cash-coin'
    };
    return icons[categorie] || 'bi-folder';
  }

  getCategorieLabel(categorie: string): string {
    const labels: { [key: string]: string } = {
      'vehicule': 'Véhicule',
      'chauffeur': 'Chauffeur',
      'administratif': 'Administratif',
      'financier': 'Financier'
    };
    return labels[categorie] || categorie;
  }

  getStatutClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'valide': 'bg-success',
      'expire': 'bg-danger',
      'expirant': 'bg-warning',
      'invalide': 'bg-secondary'
    };
    return classes[statut] || 'bg-secondary';
  }

  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'valide': 'Valide',
      'expire': 'Expiré',
      'expirant': 'Expire bientôt',
      'invalide': 'Invalide'
    };
    return labels[statut] || statut;
  }

  getExtensionIcon(extension: string): string {
    const icons: { [key: string]: string } = {
      'pdf': 'bi-filetype-pdf',
      'jpg': 'bi-filetype-jpg',
      'jpeg': 'bi-filetype-jpg',
      'png': 'bi-filetype-png',
      'doc': 'bi-filetype-doc',
      'docx': 'bi-filetype-docx',
      'xls': 'bi-filetype-xls',
      'xlsx': 'bi-filetype-xlsx'
    };
    return icons[extension.toLowerCase()] || 'bi-file-earmark';
  }

  getJoursRestants(dateExpiration?: Date): number | null {
    return this.documentService.getJoursRestants(dateExpiration);
  }

  trackById(index: number, item: any): number {
    return item.id;
  }
}
