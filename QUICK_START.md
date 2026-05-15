# ⚡ QUICK START - Démarrage rapide (5 minutes)

## 1️⃣ Vérifier le backend (1 min)
```bash
# Backend doit être en cours d'exécution
curl http://localhost:8080/api/chauffeurs
# Doit retourner: []  ou  [{...}] (liste JSON)
```

## 2️⃣ Mettre à jour 1 champ du template (1 min)

Dans `chauffeurs.component.html`, remplacer:
```html
<!-- ❌ AVANT -->
{{ formatDate(c.dateEmbauche) }}

<!-- ✅ APRÈS -->
{{ formatDate(c.dateExpirationPermis) }}
```

Voir `GUIDE_TEMPLATE_HTML.md` pour tous les champs.

## 3️⃣ Lancer l'app (1 min)
```bash
ng serve
# Ouvrir http://localhost:4200
```

## 4️⃣ Tester CRUD (2 min)

### Test GET
- Aller sur "Chauffeurs"
- Voir la liste s'afficher ✅

### Test CREATE
- Cliquer "Ajouter un chauffeur"
- Remplir: Nom, Prénom, Email
- Cliquer "Créer"
- Voir apparaître dans la liste ✅

### Test UPDATE
- Cliquer "Éditer"
- Modifier un champ
- Cliquer "Mettre à jour" ✅

### Test DELETE
- Cliquer "Supprimer"
- Confirmer
- Disparaît de la liste ✅

---

## 🐛 Si ça ne fonctionne pas

### "Impossible de joindre le serveur"
```bash
# Vérifier backend
mvn spring-boot:run
# Ou: Spring Boot IDE
```

### "CORS error"
```java
// Ajouter dans ChauffeurController
@CrossOrigin(origins = "http://localhost:4200")
```

### "404 - endpoint not found"
```typescript
// Vérifier URL dans service
// Doit être: http://localhost:8080/api/chauffeurs
```

---

## 📚 Documentation complète

- `README_INTEGRATION.md` - Vue d'ensemble
- `GUIDE_TEMPLATE_HTML.md` - Mettre à jour le template
- `IMPLEMENTATION_CHECKLIST.md` - Checklist détaillée
- `INTEGRATION_BACKEND.md` - Configuration API

---

## ✅ Checklist minimale

- [ ] Backend en cours d'exécution
- [ ] npm serve lancé
- [ ] Template HTML mis à jour (au minimum dateEmbauche → dateExpirationPermis)
- [ ] Liste des chauffeurs s'affiche
- [ ] Créer un chauffeur fonctionne
- [ ] Éditer fonctionne
- [ ] Supprimer fonctionne

---

**Besoin d'aide?** Voir `IMPLEMENTATION_CHECKLIST.md` section "Dépannage courant"

**Status:** 🚀 Prêt à utiliser!
