import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Vehicules } from '../Modeles/vehicules';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VehiculesService {

  // Constructeur pour injecter le HttpClient
  constructor(private http: HttpClient) { }

  //Methode pour récupérer la liste des véhicules depuis l'API
  getVehicules():Observable<Vehicules[]> {
    return this.http.get<Vehicules[]>('http://localhost:8080/api/vehicules');
    
  }
}
