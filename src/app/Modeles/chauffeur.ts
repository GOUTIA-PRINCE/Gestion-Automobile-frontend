/**
 * Interface Chauffeur basée sur l'entité backend
 * Étend les champs de Utilisateur avec les champs spécifiques Chauffeur
 */
export interface Chauffeur {
  // Champs hérités de Utilisateur
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  password?: string; // optionnel en lecture
  statut: string; // 'ACTIF' | 'INACTIF'
  dateCreation: string;
  derniereConnexion?: string;
  adresse?: string;
  role?: any; // Role object si nécessaire

  // Champs spécifiques Chauffeur
  numeroPermis: string;
  categoriePermis: string;
  dateExpirationPermis: string;
  disponible: boolean;
  site: string;
  experienceAnnees: number;

  // Champs optionnels UI
  dateEmbauche?: string;
  dateNaissance?: string;
  photoData?: string;
  photoMimeType?: string;
  vehiculeAttribue?: {
    id?: number;
    marque: string;
    modele: string;
    immatriculation: string;
  };
  photoUrl?: string;
}
