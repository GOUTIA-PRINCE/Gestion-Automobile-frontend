import { Component, signal, computed, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarburantService } from '../../services/carburant.service';
import { Chart, registerables } from 'chart.js';
import { VehiculesService } from '../../services/vehicules.service';
import { Vehicules } from '../../Modeles/vehicules';
import { Plein } from '../../Modeles/carburant';
import { ChauffeurService } from '../../services/chauffeur.service';
import { Chauffeur } from '../../Modeles/chauffeur';

@Component({
  selector: 'app-carburant',
  imports: [CommonModule, FormsModule],
  templateUrl: './carburant.component.html',
  styleUrl: './carburant.component.css'
})
export class CarburantComponent implements OnInit {
  private carburantService = inject(CarburantService);
  private vehiculesService = inject(VehiculesService);
  private chauffeurService = inject(ChauffeurService);
  private platformId = inject(PLATFORM_ID);

  // Signals
  pleins = this.carburantService.pleins;
  filtreVehicule = this.carburantService.filtreVehicule;
  searchQuery = this.carburantService.searchQuery;
  isLoading = signal(false);
  isFormOpen = signal(false);
  selectedPlein = signal<any>(null);
  vehicules = signal<Vehicules[]>([]);
  chauffeurs = signal<Chauffeur[]>([]);
  formData: Partial<Plein> = this.createEmptyForm();
  chart: Chart | null = null;

  // Computed
  filteredPleins = computed(() => this.carburantService.getFilteredPleins());
  stats = computed(() => this.carburantService.getStats());
  evolutionData = computed(() => this.carburantService.getEvolutionData());
  consommationParVehicule = computed(() => this.carburantService.getConsommationParVehicule());
  vehiculesOptions = computed(() => {
    const vehicules = this.stats().vehicules;
    return ['tous', ...vehicules];
  });

  ngOnInit() {
    Chart.register(...registerables);
    this.vehiculesService.getVehicules().subscribe({
      next: data => this.vehicules.set(data),
      error: err => console.error('Erreur chargement vehicules', err)
    });
    this.chauffeurService.getChauffeurs().subscribe({
      next: data => this.chauffeurs.set(data),
      error: err => console.error('Erreur chargement chauffeurs', err)
    });
    this.initChart();
  }

  initChart() {
    if (!isPlatformBrowser(this.platformId)) {
      return; // N'exécute le code que côté client
    }

    const canvas = document.getElementById('evolutionChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const data = this.evolutionData();
    const labels = data.map(d => d.mois);
    const consommationData = data.map(d => d.consommation);

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Consommation (L)',
          data: consommationData,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const index = context.dataIndex;
                const consommation = data[index].consommation;
                const cout = data[index].cout.toLocaleString('fr-FR');
                return [
                  `Consommation: ${consommation} L`,
                  `Coût: ${cout} FCFA`
                ];
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value + ' L';
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  handleAdd(): void {
    this.selectedPlein.set(null);
    this.formData = this.createEmptyForm();
    this.isFormOpen.set(true);
  }

  handleEdit(plein: any): void {
    this.selectedPlein.set(plein);
    this.formData = { ...plein };
    this.isFormOpen.set(true);
  }

  handleSubmit(): void {
    const vehicule = this.vehicules().find(v => v.id === Number(this.formData.vehiculeId));
    const chauffeur = this.chauffeurs().find(c => c.id === Number(this.formData.chauffeurId));
    if (!vehicule || !this.formData.date || !this.formData.quantite || !this.formData.prixParLitre) {
      alert('Veuillez renseigner le vehicule, la date, la quantite et le prix par litre');
      return;
    }

    const plein: Omit<Plein, 'id'> = {
      date: new Date(this.formData.date),
      vehiculeId: vehicule.id,
      vehiculeImmatriculation: vehicule.immatriculation,
      vehiculeMarque: vehicule.marque,
      vehiculeModele: vehicule.modele,
      chauffeurId: chauffeur?.id,
      chauffeurNom: chauffeur ? `${chauffeur.prenom} ${chauffeur.nom}` : undefined,
      quantite: Number(this.formData.quantite),
      cout: Number(this.formData.quantite) * Number(this.formData.prixParLitre),
      prixParLitre: Number(this.formData.prixParLitre),
      station: this.formData.station || '',
      kilometrage: Number(this.formData.kilometrage || vehicule.kilometrage || 0),
      typeCarburant: this.formData.typeCarburant || 'Diesel',
      commentaire: this.formData.commentaire
    };

    const selected = this.selectedPlein();
    if (selected) {
      this.carburantService.updatePlein(selected.id, plein);
    } else {
      this.carburantService.addPlein(plein);
    }
    this.isFormOpen.set(false);
  }

  handleDelete(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce plein ?')) {
      this.carburantService.deletePlein(id);
    }
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const mois = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    return `${d.getDate()} ${mois[d.getMonth()]} ${d.getFullYear()}`;
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  private createEmptyForm(): Partial<Plein> {
    return {
      date: new Date(),
      vehiculeId: undefined,
      quantite: 0,
      prixParLitre: 0,
      station: '',
      kilometrage: 0,
      typeCarburant: 'Diesel'
    };
  }
}
