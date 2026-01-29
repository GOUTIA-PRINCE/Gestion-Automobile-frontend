import { Component,signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarburantService } from '../../services/carburant.service';
 import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-carburant',
  imports: [CommonModule, FormsModule],
  templateUrl: './carburant.component.html',
  styleUrl: './carburant.component.css'
})
export class CarburantComponent implements OnInit {
  private carburantService = inject(CarburantService);

  // Signals
  pleins = this.carburantService.pleins;
  filtreVehicule = this.carburantService.filtreVehicule;
  searchQuery = this.carburantService.searchQuery;
  isLoading = signal(false);
  isFormOpen = signal(false);
  selectedPlein = signal<any>(null);
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
    this.initChart();
  }

  initChart() {
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
    this.isFormOpen.set(true);
  }

  handleEdit(plein: any): void {
    this.selectedPlein.set(plein);
    this.isFormOpen.set(true);
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
}
