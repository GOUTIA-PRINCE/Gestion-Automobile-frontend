# Intégration Frontend-Backend - Chauffeurs

## 📋 Résumé des changements

Intégration complète du module **Chauffeurs** avec votre backend Spring Boot en suivant les bonnes pratiques Angular 19.

### ✅ Mises à jour effectuées

#### 1. **Modèle Chauffeur** (`src/app/Modeles/chauffeur.ts`)
- ✅ Aligné avec l'entité backend Java
- ✅ Ajout des champs hérités de `Utilisateur`:
  - `password` (optionnel en lecture)
  - `statut` → 'ACTIF' | 'INACTIF'
  - `dateCreation`
  - `derniereConnexion`
  - `adresse`
  - `role`

- ✅ Champs spécifiques Chauffeur:
  - `numeroPermis`
  - `categoriePermis`
  - `dateExpirationPermis`
  - `disponible` (booléen)
  - `site`
  - `experienceAnnees`

#### 2. **Service Chauffeur** (`src/app/services/chauffeur.service.ts`)

Refactorisé avec **bonnes pratiques Angular 19**:

**✅ Architecture Reactive:**
- Signals pour la gestion d'état (chauffeurs, searchQuery, isLoading, error)
- Computed values pour filtrage et statistiques
- Observable-based avec `tap()` et `catchError()`

**✅ Opérations CRUD complètes:**
```typescript
// Lecture
getChauffeurs(): Observable<Chauffeur[]>
getChauffeurById(id: number): Observable<Chauffeur>
loadChauffeurs(): void

// Création
addChauffeur(chauffeur): Observable<Chauffeur>

// Mise à jour
updateChauffeur(id, chauffeur): Observable<Chauffeur>

// Suppression
deleteChauffeur(id): Observable<void>
```

**✅ Gestion d'erreurs centralisée:**
- Méthode `handleError()` pour uniformiser les messages d'erreur
- Intégration du signal `error` pour affichage dans le template
- Logging centralisé

**✅ Types stricts:**
- Utilisation de types TypeScript complets
- Omit pour exclure les champs non-modifiables
- Partial pour les mises à jour partielles

#### 3. **Composant Chauffeurs** (`src/app/components/chauffeurs/chauffeurs.component.ts`)

Complètement refactorisé avec **meilleures pratiques**:

**✅ Gestion d'état améliorée:**
- Utilisation du signal `isLoading` du service
- Utilisation du signal `error` du service
- Signaux locaux pour formulaire et sélection

**✅ Gestion du cycle de vie:**
- `ngOnInit()` qui appelle `loadData()`
- Méthode `loadData()` privée pour charger chauffeurs + véhicules
- Gestion correcte des erreurs de chargement

**✅ Actions utilisateur:**
- `handleAdd()` - Créer un nouveau chauffeur
- `handleEdit()` - Éditer un chauffeur existant
- `handleDelete()` - Supprimer avec confirmation
- `handleSubmit()` - Validation et soumission du formulaire

**✅ Validation du formulaire:**
- Vérification des champs obligatoires
- Trimming des espaces inutiles
- Messages d'erreur à l'utilisateur

**✅ Helpers utilitaires:**
- `formatDate()` - Formate les dates en 'fr-FR'
- `formatStatut()` - Map des statuts de la base de données
- `isPermisExpire()` - Vérifie l'expiration du permis
- `getInitials()` - Génère les initiales
- `trackByChauffeurId()` - Performance ngFor

---

## 🔌 Configuration de l'API

### URL de base
```
http://localhost:8080/api/chauffeurs
```

### Endpoints
| Méthode | Route | Fonction |
|---------|-------|----------|
| GET | `/api/chauffeurs` | Récupère tous les chauffeurs |
| GET | `/api/chauffeurs/{id}` | Récupère un chauffeur |
| POST | `/api/chauffeurs` | Crée un chauffeur |
| PUT | `/api/chauffeurs/{id}` | Met à jour un chauffeur |
| DELETE | `/api/chauffeurs/{id}` | Supprime un chauffeur |

---

## 🎯 Flux de données

```
Backend (Spring Boot)
    ↓ HTTP (GET/POST/PUT/DELETE)
Service Angular (ChauffeurService)
    ↓ Observable
Composant (ChauffeursComponent)
    ↓ Signals + Computed
Template HTML
```

### Exemple: Créer un chauffeur
```typescript
// Formulaire remplit par l'utilisateur
const formData = {
  nom: 'Dupont',
  prenom: 'Jean',
  email: 'jean.dupont@example.com',
  numeroPermis: 'AB123456',
  categoriePermis: 'B',
  dateExpirationPermis: '2026-05-14',
  disponible: true,
  site: 'Paris',
  experienceAnnees: 5,
  // ... autres champs
};

// Appel service
this.chauffeurService.addChauffeur(formData).subscribe({
  next: (newChauffeur) => {
    console.log('Chauffeur créé:', newChauffeur);
    this.closeForm();
  },
  error: (err) => {
    alert('Erreur: ' + err.message);
  }
});
```

---

## 📱 Mapping des champs

### Interface TypeScript → Entité Java

| Frontend (TypeScript) | Backend (Java) | Type | Obligatoire |
|----------------------|----------------|------|------------|
| `id` | `id` | Long | ✅ |
| `nom` | `nom` | String | ✅ |
| `prenom` | `prenom` | String | ✅ |
| `email` | `email` | String | ✅ |
| `telephone` | `telephone` | String | ✅ |
| `password` | `password` | String | ✅ |
| `statut` | `statut` | String | ✅ |
| `dateCreation` | `dateCreation` | LocalDateTime | ✅ |
| `derniereConnexion` | `derniereConnexion` | LocalDateTime | ❌ |
| `adresse` | `adresse` | String | ❌ |
| `role` | `role` | Role | ❌ |
| `numeroPermis` | `numeroPermis` | String | ❌ |
| `categoriePermis` | `categoriePermis` | String | ❌ |
| `dateExpirationPermis` | `dateExpirationPermis` | LocalDate | ❌ |
| `disponible` | `disponible` | Boolean | ❌ |
| `site` | `site` | String | ❌ |
| `experienceAnnees` | `experienceAnnees` | Integer | ❌ |

---

## 🔐 Bonnes pratiques appliquées

### 1. **Séparation des responsabilités**
- ✅ Service = logique métier + appels API
- ✅ Composant = gestion UI + interaction utilisateur
- ✅ Modèle = structure de données unique

### 2. **Gestion d'état réactive**
- ✅ Signals pour état local rapide
- ✅ Observables pour async operations
- ✅ Computed pour dérivations d'état

### 3. **Typage strict**
- ✅ Interfaces complètes
- ✅ Typage des retours Observable
- ✅ Utilisation de `Omit` et `Partial`

### 4. **Gestion d'erreurs**
- ✅ Try-catch centralisé dans le service
- ✅ Messages d'erreur utilisateur-friendly
- ✅ Logging pour debug

### 5. **Performance**
- ✅ `trackBy` pour ngFor
- ✅ OnDestroy + unsubscribe (à ajouter si nécessaire)
- ✅ Computed values pour éviter recalculs

### 6. **Accessibilité**
- ✅ Formatage des dates cohérent
- ✅ Messages d'erreur clairs
- ✅ Confirmations de suppression

---

## 🚀 Utilisation

### Charger les chauffeurs au démarrage
```typescript
ngOnInit() {
  this.chauffeurService.loadChauffeurs();
}
```

### Accéder aux données dans le template
```html
<!-- Afficher la liste filtrée -->
<div *ngFor="let chauffeur of filteredChauffeurs(); trackBy: trackByChauffeurId">
  {{ chauffeur.nom }} {{ chauffeur.prenom }}
  <span *ngIf="isPermisExpire(chauffeur.dateExpirationPermis)" class="text-danger">
    Permis expiré!
  </span>
</div>

<!-- Afficher le statut de chargement -->
<div *ngIf="isServiceLoading()">
  Chargement...
</div>

<!-- Afficher les erreurs -->
<div *ngIf="serviceError() as error" class="alert alert-danger">
  {{ error }}
</div>

<!-- Statistiques -->
<p>Total: {{ stats().total }} chauffeurs</p>
<p>Disponibles: {{ stats().disponibles }}</p>
```

### Créer/Modifier/Supprimer
```typescript
// Créer
this.handleAdd();

// Éditer
this.handleEdit(chauffeur);

// Supprimer
this.handleDelete(chauffeur.id);

// Soumettre le formulaire
this.handleSubmit();
```

---

## 📝 Checklist pour l'API

Avant de tester, assurez-vous que:

- ✅ Backend Spring Boot démarre sans erreurs
- ✅ L'endpoint `GET /api/chauffeurs` retourne une liste JSON
- ✅ CORS est configuré si frontend et backend sont sur des ports différents
- ✅ Les logs du backend montrent les requêtes reçues
- ✅ Les dates sont en format ISO (YYYY-MM-DD ou ISO 8601)

---

## 🐛 Dépannage

### "Erreur 404 - Endpoint non trouvé"
→ Vérifiez l'URL de base dans le service: `http://localhost:8080/api/chauffeurs`

### "Erreur CORS"
→ Configurez CORS dans votre contrôleur Spring:
```java
@RestController
@RequestMapping("api/chauffeurs")
@CrossOrigin(origins = "http://localhost:4200")
public class ChauffeurController { ... }
```

### "Erreur 400 - Bad Request"
→ Vérifiez que les champs obligatoires sont envoyés avec le bon format

### "Erreur 500 - Internal Server Error"
→ Consultez les logs du backend pour plus de détails

---

## 📚 Ressources complémentaires

- [Angular Signals Documentation](https://angular.io/guide/signals)
- [RxJS Operators](https://rxjs.dev/guide/operators)
- [HTTP Client Guide](https://angular.io/guide/http)
- [Spring Boot REST API](https://spring.io/guides/gs/rest-service/)

---

**Version:** 1.0  
**Date:** 2026-05-14  
**Auteur:** GitHub Copilot  
**Status:** ✅ Complété
