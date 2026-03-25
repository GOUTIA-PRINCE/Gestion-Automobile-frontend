import { CommonModule } from '@angular/common';
import { Component, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Vehicules } from '../../Modeles/vehicules';
import { VehiculesService } from '../../services/vehicules.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-vehicules',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './vehicules.component.html',
  styleUrls: ['./vehicules.component.css']
})
export class VehiculesComponent implements OnInit {

  constructor(private vehiculesService: VehiculesService) { }

  // Signal pour stocker la liste des véhicules
  vehicles = signal<Vehicules[]>([]);
 
  //methode pour initialiser le composant et charger les données des véhicules depuis l'API
  ngOnInit(): void {
    this.vehiculesService.getVehicules().subscribe(
      data => {
      // Met à jour le signal avec les données récupérées
      this.vehicles.set(data);
      console.log('Véhicules récupérés :', this.vehicles());

    });
  }

  // Autres signaux pour gérer l'état de l'interface
  isLoading = signal(false);
  canManage = true;

  searchQuery = signal('');
  isFormOpen = signal(false);
  selectedVehicle = signal<Vehicules | null>(null);

  // Computed pour filtrer les véhicules en fonction de la recherche
  filteredVehicles = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.vehicles().filter(v =>
      v.immatriculation.toLowerCase().includes(q) ||
      v.marque.toLowerCase().includes(q) ||
      v.modele.toLowerCase().includes(q)
    );
  });

  // Computed pour afficher les statistiques sur les véhicules
  stats = computed(() => ({
    total: this.vehicles().length,
    actifs: this.vehicles().filter(v => v.statut === 'actif').length,
    maintenance: this.vehicles().filter(v => v.statut === 'en_maintenance').length,
    enPanne: this.vehicles().filter(v => v.statut === 'en_panne').length,
  }));

  // Méthodes pour gérer l'ouverture du formulaire d'ajout/édition
  handleAdd(): void {
    this.selectedVehicle.set(null);
    this.isFormOpen.set(true);
  }

  // Méthode pour gérer l'édition d'un véhicule
  handleEdit(v: Vehicules): void {
    this.selectedVehicle.set(v);
    this.isFormOpen.set(true);
  }

  // Méthode pour gérer la suppression d'un véhicule
  trackByVehiculeId(index: number, v: Vehicules): number {
    return v.id;
  }
}