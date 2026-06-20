import { Component, OnInit, OnDestroy, AfterViewInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { GeolocalisationService } from '../../services/geolocalisation.service';

interface PositionActive {
  id: number;
  latitude: number;
  longitude: number;
  horodatage: string;
  voyage: {
    id: number;
    pointDepart: string;
    pointArrivee: string;
    vehicule: { marque: string; modele: string; immatriculation: string };
    chauffeur: { nom: string; prenom: string };
  };
}

@Component({
  selector: 'app-carte-vehicules',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carte-vehicules.component.html',
  styleUrl: './carte-vehicules.component.css'
})
export class CarteVehiculesComponent implements OnInit, AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private geoService = inject(GeolocalisationService);

  private map: any;
  private markers: Map<number, any> = new Map();
  private intervalId: any;
  private L: any;

  nombreVehiculesActifs = 0;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initialiserCarte();
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private async initialiserCarte(): Promise<void> {
    this.L = await import('leaflet');

    this.map = this.L.map('carte-vehicules').setView([4.0511, 9.7679], 7);

    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(this.map);

    this.chargerPositions();
    this.intervalId = setInterval(() => this.chargerPositions(), 10000);
  }

  private chargerPositions(): void {
   this.geoService.getPositionsActives().subscribe({
      next: (positions: PositionActive[]) => {
        this.nombreVehiculesActifs = positions.length;
        this.mettreAJourMarqueurs(positions);
      },
      error: (err: any) => console.error('Erreur chargement positions actives', err)
    });
  }

  private mettreAJourMarqueurs(positions: PositionActive[]): void {
    const idsActifs = new Set(positions.map(p => p.voyage.id));

    this.markers.forEach((marker, voyageId) => {
      if (!idsActifs.has(voyageId)) {
        this.map.removeLayer(marker);
        this.markers.delete(voyageId);
      }
    });

    positions.forEach(position => {
      const voyageId = position.voyage.id;
      const latLng: [number, number] = [position.latitude, position.longitude];
      const vehicule = position.voyage.vehicule;
      const chauffeur = position.voyage.chauffeur;

      const popupContent = `
        <strong>${vehicule.marque} ${vehicule.modele}</strong><br>
        ${vehicule.immatriculation}<br>
        Chauffeur: ${chauffeur.prenom} ${chauffeur.nom}<br>
        ${position.voyage.pointDepart} → ${position.voyage.pointArrivee}
      `;

      if (this.markers.has(voyageId)) {
        this.markers.get(voyageId).setLatLng(latLng);
        this.markers.get(voyageId).setPopupContent(popupContent);
      } else {
        const marker = this.L.marker(latLng).addTo(this.map);
        marker.bindPopup(popupContent);
        this.markers.set(voyageId, marker);
      }
    });
  }
}