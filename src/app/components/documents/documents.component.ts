import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../services/document.service';
import { VehiculesService } from '../../services/vehicules.service';
import { ChauffeurService } from '../../services/chauffeur.service';
import { Vehicules } from '../../Modeles/vehicules';
import { Chauffeur } from '../../Modeles/chauffeur';
import { Document } from '../../Modeles/ducument';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-documents',
  imports: [CommonModule, FormsModule],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.css'
})
export class DocumentsComponent {

  private documentService = inject(DocumentService);
  private vehiculesService = inject(VehiculesService);
  private chauffeurService = inject(ChauffeurService);
  private authService = inject(AuthService);

  // Signals
  documents = this.documentService.documents;
  filtreType = this.documentService.filtreType;
  filtreCategorie = this.documentService.filtreCategorie;
  searchQuery = this.documentService.searchQuery;
  isLoading = signal(false);
  isUploadOpen = signal(false);
  vehicules = signal<Vehicules[]>([]);
  chauffeurs = signal<Chauffeur[]>([]);
  formData: Partial<Document> & { tagsText?: string } = this.createEmptyForm();

  // Computed
  filteredDocuments = computed(() => this.documentService.getFilteredDocuments());
  stats = computed(() => this.documentService.getStats());
  typesOptions = computed(() => this.documentService.getTypes());
  categoriesOptions = computed(() => this.documentService.getCategories());

  get canWrite(): boolean {
    return this.authService.hasPermission('documents:write');
  }
  
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

  constructor() {
    this.vehiculesService.getVehicules().subscribe({
      next: data => this.vehicules.set(data),
      error: err => console.error('Erreur chargement vehicules', err)
    });
    this.chauffeurService.getChauffeurs().subscribe({
      next: data => this.chauffeurs.set(data),
      error: err => console.error('Erreur chargement chauffeurs', err)
    });
  }

  // ... le reste de votre code reste inchangé
  handleUpload(): void {
    this.formData = this.createEmptyForm();
    this.isUploadOpen.set(true);
  }

  handleSubmit(): void {
    if (!this.formData.type || !this.formData.titre || !this.formData.categorie) {
      alert('Veuillez renseigner le type, le titre et la categorie');
      return;
    }

    const vehicule = this.vehicules().find(v => v.id === Number(this.formData.vehiculeId));
    const chauffeur = this.chauffeurs().find(c => c.id === Number(this.formData.chauffeurId));
    const document: Omit<Document, 'id'> = {
      type: this.formData.type,
      titre: this.formData.titre,
      description: this.formData.description,
      vehiculeId: vehicule?.id,
      vehiculeImmatriculation: vehicule?.immatriculation,
      vehiculeMarque: vehicule?.marque,
      vehiculeModele: vehicule?.modele,
      chauffeurId: chauffeur?.id,
      chauffeurNom: chauffeur ? `${chauffeur.prenom} ${chauffeur.nom}` : undefined,
      dateCreation: this.formData.dateCreation ? new Date(this.formData.dateCreation) : new Date(),
      dateExpiration: this.formData.dateExpiration ? new Date(this.formData.dateExpiration) : undefined,
      dateMaj: new Date(),
      taille: Number(this.formData.taille || 0),
      extension: this.formData.extension || 'pdf',
      nomFichier: this.formData.nomFichier,
      typeContenu: this.formData.typeContenu,
      donneesFichier: this.formData.donneesFichier,
      statut: this.formData.statut || 'valide',
      categorie: this.formData.categorie,
      tags: this.formData.tagsText ? this.formData.tagsText.split(',').map(t => t.trim()).filter(Boolean) : []
    };

    this.documentService.addDocument(document);
    this.isUploadOpen.set(false);
  }

  handleView(document: any): void {
    console.log('Visualiser document:', document);
    this.openDocument(document);
  }

  handleDownload(document: any): void {
    this.openDocument(document);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      const extension = file.name.includes('.') ? file.name.split('.').pop() || '' : '';
      this.formData.nomFichier = file.name;
      this.formData.typeContenu = file.type || 'application/octet-stream';
      this.formData.donneesFichier = base64;
      this.formData.taille = Math.ceil(file.size / 1024);
      this.formData.extension = extension.toLowerCase();
    };
    reader.readAsDataURL(file);
  }

  openDocument(document: Document): void {
    if (document.donneesFichier && document.typeContenu) {
      const byteCharacters = atob(document.donneesFichier);
      const byteNumbers = Array.from(byteCharacters, char => char.charCodeAt(0));
      const blob = new Blob([new Uint8Array(byteNumbers)], { type: document.typeContenu });
      window.open(URL.createObjectURL(blob), '_blank');
    }
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

  private createEmptyForm(): Partial<Document> & { tagsText?: string } {
    return {
      type: 'assurance',
      titre: '',
      description: '',
      dateCreation: new Date(),
      taille: 0,
      extension: 'pdf',
      nomFichier: '',
      typeContenu: '',
      donneesFichier: '',
      statut: 'valide',
      categorie: 'vehicule',
      tagsText: ''
    };
  }
}
