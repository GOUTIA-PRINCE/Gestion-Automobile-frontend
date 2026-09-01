import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PositionRequest {
  voyageId: number;
  latitude: number;
  longitude: number;
}

export interface VoyageRequest {
  vehiculeId: number;
  chauffeurId: number;
  pointDepart: string;
  pointArrivee: string;
}

export interface PlanifierMissionRequest {
  vehiculeId: number;
  chauffeurId: number;
  pointDepart: string;
  pointArrivee: string;
}

@Injectable({ providedIn: 'root' })
export class GeolocalisationService {
  private apiUrl = '/api';
  private watchId: number | null = null;

  constructor(private http: HttpClient) {}

  planifierMission(request: PlanifierMissionRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/voyages/planifier`, request);
  }

  declencherDepart(voyageId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/voyages/${voyageId}/declencher`, {});
  }

  terminerVoyage(voyageId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/voyages/${voyageId}/terminer`, {});
  }

  enregistrerPosition(request: PositionRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/positions`, request);
  }

  getVoyagesEnCours(): Observable<any> {
    return this.http.get(`${this.apiUrl}/voyages/en-cours`);
  }

  getVoyagesParChauffeur(chauffeurId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/voyages/chauffeur/${chauffeurId}`);
  }

  getToutesLesMissions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/voyages/toutes`);
  }

  getPositionsActives(): Observable<any> {
    return this.http.get(`${this.apiUrl}/positions/actives`);
  }

  getDernierePosition(voyageId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/positions/voyage/${voyageId}/derniere`);
  }

  getHistoriquePositions(voyageId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/positions/voyage/${voyageId}`);
  }

  demarrerSuiviPosition(voyageId: number, intervalleMs: number = 10000): void {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par ce navigateur');
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const req: PositionRequest = {
          voyageId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        this.enregistrerPosition(req).subscribe({
          error: (err) => console.error('Erreur envoi position', err)
        });
      },
      (error) => console.error('Erreur géolocalisation', error),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
  }

  arreterSuiviPosition(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
}