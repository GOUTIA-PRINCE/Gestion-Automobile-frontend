import { Injectable, signal } from '@angular/core';
import { Chauffeur } from '../Modeles/chauffeur';

@Injectable({
  providedIn: 'root'
})
export class ChauffeurService {

  private chauffeursData: Chauffeur[] = [
    {
      id: 1,
      nom: 'Nguema',
      prenom: 'Jean-Pierre',
      telephone: '+237 699 123 456',
      email: 'jp.nguema@company.cm',
      numeroPermis: 'B-2019-45678',
      dateEmbauche: '01/03/2019',
      statut: 'actif',
      vehiculeAttribue: {
        marque: 'Toyota',
        modele: 'Hilux',
        immatriculation: 'LT 1234 A'
      },
      photoUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      dateNaissance: '15/08/1985',
      adresse: 'Yaoundé, Cameroun',
      experience: 5
    },
    {
      id: 2,
      nom: 'Fotso',
      prenom: 'Marie',
      telephone: '+237 677 234 567',
      email: 'm.fotso@company.cm',
      numeroPermis: 'B-2018-34567',
      dateEmbauche: '15/06/2018',
      statut: 'actif',
      vehiculeAttribue: {
        marque: 'Mitsubishi',
        modele: 'L200',
        immatriculation: 'CE 5678 B'
      },
      photoUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      dateNaissance: '22/11/1990',
      adresse: 'Douala, Cameroun',
      experience: 6
    },
    {
      id: 3,
      nom: 'Mbappe',
      prenom: 'Samuel',
      telephone: '+237 655 345 678',
      email: 's.mbappe@company.cm',
      numeroPermis: 'B-2020-56789',
      dateEmbauche: '10/01/2020',
      statut: 'mission',
      vehiculeAttribue: {
        marque: 'Ford',
        modele: 'Ranger',
        immatriculation: 'LT 9012 C'
      },
      photoUrl: 'https://randomuser.me/api/portraits/men/22.jpg',
      dateNaissance: '30/03/1988',
      adresse: 'Bafoussam, Cameroun',
      experience: 4
    },
    {
      id: 4,
      nom: 'Kouam',
      prenom: 'Amina',
      telephone: '+237 699 987 654',
      email: 'a.kouam@company.cm',
      numeroPermis: 'B-2021-67890',
      dateEmbauche: '20/09/2021',
      statut: 'congé',
      photoUrl: 'https://randomuser.me/api/portraits/women/33.jpg',
      dateNaissance: '12/07/1993',
      adresse: 'Garoua, Cameroun',
      experience: 3
    }
  ];

  chauffeurs = signal<Chauffeur[]>(this.chauffeursData);
  searchQuery = signal('');

  constructor() {}

  getFilteredChauffeurs() {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.chauffeurs();

    return this.chauffeurs().filter(chauffeur => 
      chauffeur.nom.toLowerCase().includes(query) ||
      chauffeur.prenom.toLowerCase().includes(query) ||
      chauffeur.telephone.includes(query) ||
      chauffeur.email.toLowerCase().includes(query) ||
      chauffeur.numeroPermis.toLowerCase().includes(query) ||
      (chauffeur.vehiculeAttribue?.immatriculation.toLowerCase().includes(query) ?? false)
    );
  }

  addChauffeur(chauffeur: Chauffeur) {
    const newId = Math.max(...this.chauffeurs().map(c => c.id)) + 1;
    const newChauffeur = { ...chauffeur, id: newId };
    this.chauffeurs.update(list => [...list, newChauffeur]);
  }

  updateChauffeur(id: number, updatedChauffeur: Partial<Chauffeur>) {
    this.chauffeurs.update(list =>
      list.map(chauffeur =>
        chauffeur.id === id ? { ...chauffeur, ...updatedChauffeur } : chauffeur
      )
    );
  }

  deleteChauffeur(id: number) {
    this.chauffeurs.update(list => list.filter(chauffeur => chauffeur.id !== id));
  }
}
