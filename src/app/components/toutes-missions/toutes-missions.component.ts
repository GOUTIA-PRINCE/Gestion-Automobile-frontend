import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeolocalisationService } from '../../services/geolocalisation.service';
import { CarteVehiculesComponent } from '../carte-vehicules/carte-vehicules.component';

interface Voyage {
  id: number;
  pointDepart: string;
  pointArrivee: string;
  dateDebut: string | null;
  dateFin: string | null;
  statut: 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'ANNULE';
  vehicule: { id: number; immatriculation: string; marque: string; modele: string };
  chauffeur: { id: number; nom: string; prenom: string };
}

@Component({
  selector: 'app-toutes-missions',
  standalone: true,
  imports: [CommonModule, CarteVehiculesComponent],
  templateUrl: './toutes-missions.component.html',
  styleUrl: './toutes-missions.component.css'
})
export class ToutesMissionsComponent implements OnInit {
  private geoService = inject(GeolocalisationService);

  missions: Voyage[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.chargerMissions();
  }

  chargerMissions(): void {
    this.isLoading = true;
    this.geoService.getToutesLesMissions().subscribe({
      next: (data: Voyage[]) => {
        this.missions = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement missions', err);
        this.isLoading = false;
      }
    });
  }
}