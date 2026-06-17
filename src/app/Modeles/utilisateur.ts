export interface Utilisateur {
  id: number;
  typeUtilisateur: 'ADMINISTRATEUR' | 'GESTIONNAIRE' | 'CHAUFFEUR' | 'MAINTENANCIER';
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  password?: string;
  statut: 'ACTIF' | 'INACTIF';
  dateCreation?: string;
  adresse?: string;
  site?: string;
  numeroPermis?: string;
  categoriePermis?: string;
  dateExpirationPermis?: string;
  permissions?: string[];
}
