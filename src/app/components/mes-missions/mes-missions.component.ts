import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { GeolocalisationService } from '../../services/geolocalisation.service';

interface Voyage {
  id: number;
  pointDepart: string;
  pointArrivee: string;
  dateDebut: string | null;
  dateFin: string | null;
  statut: 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'ANNULE';
  vehicule: { id: number; immatriculation: string; marque: string; modele: string };
}

@Component({
  selector: 'app-mes-missions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mes-missions.component.html',
  styleUrl: './mes-missions.component.css'
})
export class MesMissionsComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private geoService = inject(GeolocalisationService);

  voyages: Voyage[] = [];
  voyageEnCours: Voyage | null = null;

  ngOnInit(): void {
    this.chargerMissions();
  }

  ngOnDestroy(): void {
    this.geoService.arreterSuiviPosition();
  }

  chargerMissions(): void {
    const chauffeurId = this.auth.currentUser()?.id;
    if (!chauffeurId) return;

    this.geoService.getVoyagesParChauffeur(chauffeurId).subscribe({
      next: (voyages: Voyage[]) => {
        this.voyages = voyages;
        this.voyageEnCours = voyages.find(v => v.statut === 'EN_COURS') || null;
        if (this.voyageEnCours) {
          this.geoService.demarrerSuiviPosition(this.voyageEnCours.id);
        }
      }
    });
  }

  declencherMission(voyage: Voyage): void {
    this.geoService.declencherDepart(voyage.id).subscribe({
      next: (voyageMisAJour: Voyage) => {
        this.voyageEnCours = voyageMisAJour;
        this.geoService.demarrerSuiviPosition(voyageMisAJour.id);
        this.chargerMissions();
      },
      error: (err: any) => alert('Erreur lors du démarrage du voyage : ' + err.message)
    });
  }

  terminerVoyage(): void {
    if (!this.voyageEnCours) return;

    this.geoService.terminerVoyage(this.voyageEnCours.id).subscribe({
      next: () => {
        this.geoService.arreterSuiviPosition();
        this.voyageEnCours = null;
        this.chargerMissions();
      },
      error: (err: any) => alert('Erreur lors de la fin du voyage : ' + err.message)
    });
  }
}