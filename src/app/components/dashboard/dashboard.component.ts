import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  private dashboardService = inject(DashboardService);

  // Signals
  stats = this.dashboardService.stats;
  vehiculesResumes = this.dashboardService.vehiculesResumes;
  alertes = this.dashboardService.alertes;
  entretiensResumes = this.dashboardService.entretiensResumes;
  consommationData = this.dashboardService.consommationData;
  
  // Corrigez statsEtat - retirez le () => car c'est déjà un signal
  statsEtat = computed(() => {
    const vehicules = this.vehiculesResumes();
    return {
      actifs: vehicules.filter(v => v.statut === 'actif').length,
      enPanne: vehicules.filter(v => v.statut === 'en_panne').length,
      maintenance: vehicules.filter(v => v.statut === 'maintenance').length
    };
  });

  // Computed
  vehiculesRecents = computed(() => this.vehiculesResumes().slice(0, 3));
  alertesRecentes = computed(() => this.alertes().slice(0, 4));
  evolutionPourcentage = computed(() => {
    const data = this.consommationData();
    if (data.length < 2) return 0;
    const dernier = data[data.length - 1].consommation;
    const avantDernier = data[data.length - 2].consommation;
    return ((dernier - avantDernier) / avantDernier) * 100;
  });

  isLoading = signal(false);
  chart: Chart | null = null;

  ngOnInit() {
    Chart.register(...registerables);
    this.initChart();
  }

  initChart() {
    const canvas = document.getElementById('consommationChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const data = this.consommationData();
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
          tension: 0.4,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
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
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            padding: 12,
            cornerRadius: 6,
            callbacks: {
              label: (context) => `Consommation: ${context.parsed.y} L`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            min: 300,
            max: 450,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              callback: function(value) {
                return value + ' L';
              }
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

  formatCurrency(amount: number): string {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const mois = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    return `${d.getDate()} ${mois[d.getMonth()]}. ${d.getFullYear()}`;
  }

  getPrioriteClass(priorite: string): string {
    const classes: { [key: string]: string } = {
      'haute': 'border-danger text-danger',
      'moyenne': 'border-warning text-warning',
      'basse': 'border-success text-success'
    };
    return classes[priorite] || '';
  }

  getPrioriteIcon(priorite: string): string {
    const icons: { [key: string]: string } = {
      'haute': 'bi-exclamation-octagon',
      'moyenne': 'bi-exclamation-triangle',
      'basse': 'bi-info-circle'
    };
    return icons[priorite] || 'bi-info-circle';
  }

  getStatutClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'actif': 'badge bg-success',
      'en_panne': 'badge bg-danger',
      'maintenance': 'badge bg-warning'
    };
    return classes[statut] || 'badge bg-secondary';
  }

  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'actif': 'Actif',
      'en_panne': 'En panne',
      'maintenance': 'Maintenance'
    };
    return labels[statut] || statut;
  }

  getPourcentageClass(pourcentage: number): string {
    return pourcentage >= 0 ? 'text-success' : 'text-danger';
  }

  getPourcentageIcon(pourcentage: number): string {
    return pourcentage >= 0 ? 'bi-arrow-up' : 'bi-arrow-down';
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

}
