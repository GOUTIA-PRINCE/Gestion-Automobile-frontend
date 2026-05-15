# 📝 Guide de mise à jour du Template HTML

## Champs à mettre à jour dans le formulaire

Voici les changements à effectuer dans `chauffeurs.component.html`:

### ❌ Anciens champs (À SUPPRIMER)
- `dateEmbauche` → Remplacer par `dateExpirationPermis`
- `photoUrl` → (optionnel, garder si souhaité)
- `dateNaissance` → (optionnel, garder si souhaité)
- `experience` → Remplacer par `experienceAnnees`

### ✅ Nouveaux champs (À AJOUTER/METTRE À JOUR)

#### 1. Champs de base (mise à jour obligatoire)
```html
<!-- NOM et PRENOM - Restent les mêmes -->
<div class="col-md-6">
  <label class="form-label">Prénom *</label>
  <input type="text" class="form-control" [(ngModel)]="formData.prenom" name="prenom" required>
</div>

<div class="col-md-6">
  <label class="form-label">Nom *</label>
  <input type="text" class="form-control" [(ngModel)]="formData.nom" name="nom" required>
</div>

<!-- EMAIL - Reste le même -->
<div class="col-md-6">
  <label class="form-label">Email *</label>
  <input type="email" class="form-control" [(ngModel)]="formData.email" name="email" required>
</div>

<!-- TELEPHONE - Reste le même -->
<div class="col-md-6">
  <label class="form-label">Téléphone</label>
  <input type="tel" class="form-control" [(ngModel)]="formData.telephone" name="telephone">
</div>

<!-- ADRESSE - Reste le même -->
<div class="col-12">
  <label class="form-label">Adresse</label>
  <textarea class="form-control" [(ngModel)]="formData.adresse" name="adresse"></textarea>
</div>
```

#### 2. Champs de permis (NOUVEAUX/À METTRE À JOUR)
```html
<!-- NUMERO PERMIS -->
<div class="col-md-6">
  <label class="form-label">N° Permis *</label>
  <input type="text" class="form-control" [(ngModel)]="formData.numeroPermis" name="numeroPermis">
</div>

<!-- CATEGORIE PERMIS -->
<div class="col-md-6">
  <label class="form-label">Catégorie Permis *</label>
  <select class="form-control" [(ngModel)]="formData.categoriePermis" name="categoriePermis">
    <option value="">-- Sélectionner --</option>
    <option value="A">A</option>
    <option value="A1">A1</option>
    <option value="A2">A2</option>
    <option value="B">B</option>
    <option value="C">C</option>
    <option value="C1">C1</option>
    <option value="D">D</option>
    <option value="D1">D1</option>
    <option value="E">E</option>
    <option value="BE">BE</option>
    <option value="CE">CE</option>
    <option value="DE">DE</option>
    <option value="D1E">D1E</option>
  </select>
</div>

<!-- DATE EXPIRATION PERMIS (Remplace dateEmbauche) -->
<div class="col-md-6">
  <label class="form-label">Date Expiration Permis *</label>
  <input type="date" class="form-control" [(ngModel)]="formData.dateExpirationPermis" name="dateExpirationPermis">
  <small class="text-danger" *ngIf="isPermisExpire(formData.dateExpirationPermis)">
    ⚠️ Le permis est expiré!
  </small>
</div>

<!-- EXPERIENCE ANNEES (Remplace experience) -->
<div class="col-md-6">
  <label class="form-label">Expérience (années) *</label>
  <input type="number" class="form-control" [(ngModel)]="formData.experienceAnnees" name="experienceAnnees" min="0">
</div>
```

#### 3. Champs de statut et site (NOUVEAUX)
```html
<!-- STATUT -->
<div class="col-md-6">
  <label class="form-label">Statut</label>
  <select class="form-control" [(ngModel)]="formData.statut" name="statut">
    <option value="ACTIF">Actif</option>
    <option value="INACTIF">Inactif</option>
  </select>
</div>

<!-- SITE -->
<div class="col-md-6">
  <label class="form-label">Site</label>
  <input type="text" class="form-control" [(ngModel)]="formData.site" name="site" placeholder="ex: Paris, Lyon...">
</div>

<!-- DISPONIBLE -->
<div class="col-12">
  <div class="form-check">
    <input type="checkbox" class="form-check-input" 
           [(ngModel)]="formData.disponible" name="disponible">
    <label class="form-check-label">
      Disponible pour une mission
    </label>
  </div>
</div>
```

#### 4. Sélection véhicule (À vérifier)
```html
<!-- VEHICULE ATTRIBUE -->
<div class="col-12">
  <label class="form-label">Véhicule attribué</label>
  <select class="form-control" 
          (change)="onVehiculeSelect($event)" 
          name="vehiculeId">
    <option [value]="undefined">-- Aucun --</option>
    <option *ngFor="let v of availableVehicules()" [value]="v.id">
      {{ v.marque }} {{ v.modele }} ({{ v.immatriculation }})
    </option>
  </select>
</div>
```

---

## 📊 Affichage de la liste

### Ancien code (À remplacer)
```html
{{ formatDate(c.dateEmbauche) }}  <!-- ❌ Ancien -->
{{ c.experience }} ans             <!-- ❌ Ancien -->
```

### Nouveau code (À appliquer)
```html
<!-- Affichage simplifié -->
<td>{{ c.numeroPermis }}</td>
<td>{{ c.categoriePermis }}</td>
<td>
  {{ formatDate(c.dateExpirationPermis) }}
  <span *ngIf="isPermisExpire(c.dateExpirationPermis)" class="badge bg-danger">
    Expiré
  </span>
</td>
<td>{{ c.experienceAnnees }} ans</td>
<td>{{ formatStatut(c.statut) }}</td>
<td>{{ c.site }}</td>
<td>
  <span class="badge" [ngClass]="{'bg-success': c.disponible, 'bg-secondary': !c.disponible}">
    {{ c.disponible ? 'Disponible' : 'Occupé' }}
  </span>
</td>
```

---

## 🎯 Exemple de formulaire complet

```html
<!-- MODAL FORM -->
<div *ngIf="isFormOpen()" class="modal fade show d-block" tabindex="-1">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">
          {{ selectedChauffeur() ? 'Éditer chauffeur' : 'Créer chauffeur' }}
        </h5>
        <button type="button" class="btn-close" (click)="closeForm()"></button>
      </div>
      
      <div class="modal-body">
        <form #chauffeurForm="ngForm" (ngSubmit)="handleSubmit()">
          
          <!-- ROW 1: Identité -->
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Prénom *</label>
              <input type="text" class="form-control" 
                     [(ngModel)]="formData.prenom" name="prenom" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Nom *</label>
              <input type="text" class="form-control" 
                     [(ngModel)]="formData.nom" name="nom" required>
            </div>
          </div>

          <!-- ROW 2: Contact -->
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Email *</label>
              <input type="email" class="form-control" 
                     [(ngModel)]="formData.email" name="email" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Téléphone</label>
              <input type="tel" class="form-control" 
                     [(ngModel)]="formData.telephone" name="telephone">
            </div>
          </div>

          <!-- ROW 3: Adresse -->
          <div class="mb-3">
            <label class="form-label">Adresse</label>
            <textarea class="form-control" rows="2"
                      [(ngModel)]="formData.adresse" name="adresse"></textarea>
          </div>

          <!-- ROW 4: Permis -->
          <div class="row">
            <div class="col-md-4 mb-3">
              <label class="form-label">N° Permis *</label>
              <input type="text" class="form-control" 
                     [(ngModel)]="formData.numeroPermis" name="numeroPermis">
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Catégorie *</label>
              <select class="form-control" 
                      [(ngModel)]="formData.categoriePermis" name="categoriePermis">
                <option value="">-- Sélectionner --</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Expiration *</label>
              <input type="date" class="form-control" 
                     [(ngModel)]="formData.dateExpirationPermis" 
                     name="dateExpirationPermis">
            </div>
          </div>

          <!-- ROW 5: Experience et Site -->
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Expérience (ans) *</label>
              <input type="number" class="form-control" 
                     [(ngModel)]="formData.experienceAnnees" 
                     name="experienceAnnees" min="0">
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Site</label>
              <input type="text" class="form-control" 
                     [(ngModel)]="formData.site" name="site">
            </div>
          </div>

          <!-- ROW 6: Statut et Disponibilité -->
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Statut</label>
              <select class="form-control" 
                      [(ngModel)]="formData.statut" name="statut">
                <option value="ACTIF">Actif</option>
                <option value="INACTIF">Inactif</option>
              </select>
            </div>
            <div class="col-md-6 mb-3">
              <div class="form-check mt-4">
                <input type="checkbox" class="form-check-input" 
                       [(ngModel)]="formData.disponible" name="disponible">
                <label class="form-check-label">
                  Disponible pour mission
                </label>
              </div>
            </div>
          </div>

          <!-- ROW 7: Véhicule -->
          <div class="mb-3">
            <label class="form-label">Véhicule attribué</label>
            <select class="form-control" (change)="onVehiculeSelect($any($event.target).value)" 
                    name="vehiculeId">
              <option [value]="undefined">-- Aucun --</option>
              <option *ngFor="let v of availableVehicules()" [value]="v.id">
                {{ v.marque }} {{ v.modele }} ({{ v.immatriculation }})
              </option>
            </select>
          </div>

          <!-- Messages d'erreur -->
          <div *ngIf="serviceError() as error" class="alert alert-danger" role="alert">
            {{ error }}
          </div>

        </form>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" (click)="closeForm()">
          Annuler
        </button>
        <button type="button" class="btn btn-primary" (click)="handleSubmit()">
          {{ selectedChauffeur() ? 'Mettre à jour' : 'Créer' }}
        </button>
      </div>
    </div>
  </div>
</div>
```

---

## 📋 Checklist de mise à jour

- [ ] Remplacer `dateEmbauche` par `dateExpirationPermis`
- [ ] Remplacer `experience` par `experienceAnnees`
- [ ] Ajouter champs: `numeroPermis`, `categoriePermis`, `disponible`, `site`
- [ ] Mettre à jour le statut de `'actif'` à `'ACTIF'`
- [ ] Ajouter validation du permis expiré
- [ ] Tester l'ajout d'un chauffeur
- [ ] Tester la modification d'un chauffeur
- [ ] Tester la suppression d'un chauffeur
- [ ] Vérifier l'affichage de la liste

---

## 🔍 Validation rapide

Après mise à jour du template, vérifiez que:

```typescript
// Dans le composant
console.log(this.formData);
// Doit contenir: nom, prenom, email, numeroPermis, categoriePermis,
//                dateExpirationPermis, disponible, site, experienceAnnees

// Après soumission
console.log('Données envoyées au backend');
// Doit voir les logs dans la console du navigateur
```

---

**Status:** À appliquer  
**Priorité:** Haute  
**Temps estimé:** 15-20 minutes
