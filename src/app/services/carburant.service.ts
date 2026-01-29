import { Injectable, signal } from '@angular/core';
import { Plein, StatCarburant, EvolutionMensuelle } from '../Modeles/carburant';

@Injectable({
  providedIn: 'root'
})
export class CarburantService {

  private pleinsData: Plein[] = [
    {
      id: 1,
      date: new Date('2024-01-15'),
      vehiculeId: 1,
      vehiculeImmatriculation: 'LT 1234 A',
      vehiculeMarque: 'Toyota',
      vehiculeModele: 'Hilux',
      quantite: 65,
      cout: 45500,
      prixParLitre: 700,
      station: 'Total Akwa',
      kilometrage: 44800,
      typeCarburant: 'Diesel'
    },
    {
      id: 2,
      date: new Date('2024-01-08'),
      vehiculeId: 1,
      vehiculeImmatriculation: 'LT 1234 A',
      vehiculeMarque: 'Toyota',
      vehiculeModele: 'Hilux',
      quantite: 70,
      cout: 49000,
      prixParLitre: 700,
      station: 'MRS Bonapriso',
      kilometrage: 44200,
      typeCarburant: 'Diesel'
    },
    {
      id: 3,
      date: new Date('2024-01-14'),
      vehiculeId: 2,
      vehiculeImmatriculation: 'CE 5678 B',
      vehiculeMarque: 'Mitsubishi',
      vehiculeModele: 'L200',
      quantite: 60,
      cout: 42000,
      prixParLitre: 700,
      station: 'Total',
      kilometrage: 61500,
      typeCarburant: 'Diesel'
    },
    {
      id: 4,
      date: new Date('2024-01-20'),
      vehiculeId: 3,
      vehiculeImmatriculation: 'LT 9012 C',
      vehiculeMarque: 'Ford',
      vehiculeModele: 'Ranger',
      quantite: 75,
      cout: 52500,
      prixParLitre: 700,
      station: 'OilLibya',
      kilometrage: 32500,
      typeCarburant: 'Diesel'
    },
    {
      id: 5,
      date: new Date('2024-01-25'),
      vehiculeId: 1,
      vehiculeImmatriculation: 'LT 1234 A',
      vehiculeMarque: 'Toyota',
      vehiculeModele: 'Hilux',
      quantite: 50,
      cout: 35000,
      prixParLitre: 700,
      station: 'Total Akwa',
      kilometrage: 45200,
      typeCarburant: 'Diesel'
    }
  ];

  private evolutionData: EvolutionMensuelle[] = [
    { mois: 'Juil', consommation: 320, cout: 224000 },
    { mois: 'Août', consommation: 350, cout: 245000 },
    { mois: 'Sep', consommation: 380, cout: 266000 },
    { mois: 'Oct', consommation: 360, cout: 252000 },
    { mois: 'Nov', consommation: 390, cout: 273000 },
    { mois: 'Déc', consommation: 420, cout: 294000 },
    { mois: 'Jan', consommation: 370, cout: 268500 }
  ];

  pleins = signal<Plein[]>(this.pleinsData);
  evolutionMensuelle = signal<EvolutionMensuelle[]>(this.evolutionData);
  filtreVehicule = signal<string>('tous');
  searchQuery = signal('');

  constructor() {}

  getStats(): StatCarburant {
    const pleinsFiltres = this.getFilteredPleins();
    const consommationTotale = pleinsFiltres.reduce((sum, plein) => sum + plein.quantite, 0);
    const coutTotal = pleinsFiltres.reduce((sum, plein) => sum + plein.cout, 0);
    const prixMoyen = consommationTotale > 0 ? coutTotal / consommationTotale : 0;
    const vehicules = [...new Set(pleinsFiltres.map(p => p.vehiculeImmatriculation))];

    return {
      consommationTotale,
      coutTotal,
      prixMoyen,
      vehicules
    };
  }

  getFilteredPleins() {
    const filtre = this.filtreVehicule();
    const query = this.searchQuery().toLowerCase();
    
    let filtered = this.pleins();
    
    if (filtre !== 'tous') {
      filtered = filtered.filter(p => p.vehiculeImmatriculation === filtre);
    }
    
    if (query) {
      filtered = filtered.filter(p =>
        p.vehiculeImmatriculation.toLowerCase().includes(query) ||
        p.station.toLowerCase().includes(query) ||
        p.vehiculeMarque.toLowerCase().includes(query) ||
        p.vehiculeModele.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }

  addPlein(plein: Omit<Plein, 'id'>) {
    const newId = Math.max(...this.pleins().map(p => p.id)) + 1;
    const newPlein: Plein = { ...plein, id: newId };
    this.pleins.update(list => [...list, newPlein]);
  }

  updatePlein(id: number, updatedPlein: Partial<Plein>) {
    this.pleins.update(list =>
      list.map(plein =>
        plein.id === id ? { ...plein, ...updatedPlein } : plein
      )
    );
  }

  deletePlein(id: number) {
    this.pleins.update(list => list.filter(plein => plein.id !== id));
  }

  getEvolutionData() {
    return this.evolutionMensuelle();
  }

  getConsommationParVehicule() {
    const pleins = this.pleins();
    const vehiculesMap = new Map<string, number>();
    
    pleins.forEach(plein => {
      const current = vehiculesMap.get(plein.vehiculeImmatriculation) || 0;
      vehiculesMap.set(plein.vehiculeImmatriculation, current + plein.quantite);
    });
    
    return Array.from(vehiculesMap.entries()).map(([vehicule, consommation]) => ({
      vehicule,
      consommation
    }));
  }
}
