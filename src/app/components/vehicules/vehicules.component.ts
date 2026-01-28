import { CommonModule } from '@angular/common';
import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Vehicules } from '../../Modeles/vehicules';

@Component({
  selector: 'app-vehicules',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicules.component.html',
  styleUrls: ['./vehicules.component.css']
})
export class VehiculesComponent {

  // ======= STATE =======
  vehicles = signal<Vehicules[]>([
    {
      id: 1,
      immatriculation: 'AB-123-CD',
      marque: 'Toyota',
      modele: 'Corolla',
      annee: 2020,
      typeVehicule: 'Berline',
      statut: 'actif',
      kilometrage: 45000
    },
    {
      id: 2,
      immatriculation: 'EF-456-GH',
      marque: 'Peugeot',
      modele: '308',
      annee: 2019,
      typeVehicule: 'Compacte',
      statut: 'en_maintenance',
      kilometrage: 72000
    },
    {
      id: 3,
      immatriculation: 'IJ-789-KL',
      marque: 'Renault',
      modele: 'Clio',
      annee: 2018,
      typeVehicule: 'Citadine',
      statut: 'en_panne',
      kilometrage: 98000
    },
    // {
    //   id: 4,
    //   immatriculation: 'IJ-789-KL',
    //   marque: 'Range Rover',
    //   modele: 'Clio',
    //   annee: 2018,
    //   typeVehicule: 'Citadine',
    //   statut: 'en_panne',
    //   kilometrage: 98000
    // },
    // {
    //   id: 5,
    //   immatriculation: 'IJ-789-KL',
    //   marque: 'Suziki',
    //   modele: 'Clio',
    //   annee: 2018,
    //   typeVehicule: 'Citadine',
    //   statut: 'en_panne',
    //   kilometrage: 98000
    // },
    // {
    //   id: 6,
    //   immatriculation: 'IJ-789-KL',
    //   marque: 'Tesla',
    //   modele: 'Clio',
    //   annee: 2018,
    //   typeVehicule: 'Citadine',
    //   statut: 'en_panne',
    //   kilometrage: 98000
    // }
  ]);
  

  isLoading = signal(false);
  canManage = true;

  searchQuery = signal('');
  isFormOpen = signal(false);
  selectedVehicle = signal<Vehicules | null>(null);

  // ======= COMPUTED =======
  filteredVehicles = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.vehicles().filter(v =>
      v.immatriculation.toLowerCase().includes(q) ||
      v.marque.toLowerCase().includes(q) ||
      v.modele.toLowerCase().includes(q)
    );
  });

  stats = computed(() => ({
    total: this.vehicles().length,
    actifs: this.vehicles().filter(v => v.statut === 'actif').length,
    maintenance: this.vehicles().filter(v => v.statut === 'en_maintenance').length,
    enPanne: this.vehicles().filter(v => v.statut === 'en_panne').length,
  }));

  // ======= ACTIONS =======
  handleAdd(): void {
    this.selectedVehicle.set(null);
    this.isFormOpen.set(true);
  }

  handleEdit(v: Vehicules): void {
    this.selectedVehicle.set(v);
    this.isFormOpen.set(true);
  }

  // ======= TRACKBY =======
  trackByVehiculeId(index: number, v: Vehicules): number {
    return v.id;
  }
}