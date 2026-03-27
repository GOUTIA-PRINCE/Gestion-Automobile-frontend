export interface Chauffeur {
    id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  numeroPermis: string;
  dateEmbauche: string;
  statut: 'actif' | 'inactif' | 'congé' | 'mission';
  vehiculeAttribue?: {
    marque: string;
    modele: string;
    immatriculation: string;
  };
  /*
  vehiculeAttribue doit etre modifier par ceci plus tard 
  vehiculeAttribue?: Vehicules;
  */
  photoUrl?: string;
  dateNaissance?: string;
  adresse?: string;
  experience?: number; // en années
}
