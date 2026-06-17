import { CommonModule } from '@angular/common';
import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Vehicules } from '../../Modeles/vehicules';
import { VehiculesService } from '../../services/vehicules.service';
import { ChauffeurService } from '../../services/chauffeur.service';
import { Chauffeur } from '../../Modeles/chauffeur';
import { AuthService } from '../../services/auth.service';
// import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-vehicules',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // HttpClientModule
  ],
  templateUrl: './vehicules.component.html',
  styleUrls: ['./vehicules.component.css']
})
export class VehiculesComponent implements OnInit {

  private vehiculesService = inject(VehiculesService);
  private chauffeurService = inject(ChauffeurService);
  private authService = inject(AuthService);

  // Utiliser les signals du service (comme dans chauffeurs)
  vehicles = this.vehiculesService.vehicules;
  filteredVehicles = this.vehiculesService.filteredVehicules;
  stats = this.vehiculesService.stats;
  chauffeurs = signal<Chauffeur[]>([]);

  // Propriété intermédiaire pour searchQuery (améliore la réactivité avec ngModel)
  get searchQuery(): string {
    return this.vehiculesService.searchQuery();
  }

  set searchQuery(value: string) {
    this.vehiculesService.searchQuery.set(value);
  }
 
  //methode pour initialiser le composant et charger les données des véhicules depuis l'API
  ngOnInit(): void {
    this.vehiculesService.loadVehicules();
    this.chauffeurService.getChauffeurs().subscribe({
      next: chauffeurs => this.chauffeurs.set(chauffeurs),
      error: err => console.error('Erreur chargement chauffeurs', err)
    });
  }

  // Autres signaux pour gérer l'état de l'interface
  isLoading = signal(false);
  get canManage(): boolean {
    return this.authService.hasPermission('vehicules:write');
  }

  isFormOpen = signal(false);
  selectedVehicle = signal<Vehicules | null>(null);

  // Formulaire data pour ajouter/modifier un véhicule
  formData: Partial<Vehicules> = this.createEmptyForm();

  // Méthodes pour gérer l'ouverture du formulaire d'ajout/édition
  handleAdd(): void {
    this.selectedVehicle.set(null);
    this.formData = this.createEmptyForm();
    this.isFormOpen.set(true);
  }

  // Méthode pour gérer l'édition d'un véhicule
  handleEdit(v: Vehicules): void {
    this.selectedVehicle.set(v);
    this.formData = { ...v };
    this.isFormOpen.set(true);
  }

  // Méthode pour gérer la suppression d'un véhicule
  handleDelete(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      this.vehiculesService.deleteVehicule(id);
    }
  }

  // Méthode pour soumettre le formulaire
  handleSubmit(): void {
    if (this.selectedVehicle()) {
      // Modification d'un véhicule existant
      const id = this.selectedVehicle()!.id;
      this.vehiculesService.updateVehicule(id, { ...(this.formData as Vehicules), id }).subscribe({
        next: () => this.closeForm(),
        error: err => console.error('Erreur modification vehicule', err)
      });
    } else {
      // Ajout d'un nouveau véhicule
      this.vehiculesService.addVehicule(this.formData as Omit<Vehicules, 'id'>).subscribe({
        next: () => this.closeForm(),
        error: err => console.error('Erreur ajout vehicule', err)
      });
    }

  }

  // Méthode pour fermer le formulaire
  closeForm(): void {
    this.isFormOpen.set(false);
    this.formData = this.createEmptyForm();
    this.selectedVehicle.set(null);
  }

  // Créer un formulaire vide
  createEmptyForm(): Partial<Vehicules> {
    return {
      marque: '',
      modele: '',
      immatriculation: '',
      annee: new Date().getFullYear(),
      typeVehicule: 'Break',
      kilometrage: 0,
      statut: 'actif',
      chauffeurId: undefined,
      chauffeurNom: undefined
    };
  }

  // Méthode pour gérer le trackBy
  trackByVehiculeId(index: number, v: Vehicules): number {
    return v.id;
  }
  
}
