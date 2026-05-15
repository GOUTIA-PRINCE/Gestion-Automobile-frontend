/**
 * 📋 GUIDE DES DTOs (Data Transfer Objects) - BACKEND JAVA
 * 
 * Les DTOs sont des classes qui transportent les données entre le frontend et le backend.
 * Elles permettent de:
 * - Contrôler exactement quelles données sont exposées
 * - Valider les données reçues
 * - Transformer les données au format souhaité
 * - Améliorer la sécurité (pas d'exposer les champs sensibles)
 */

// ─── EXEMPLE DTO CHAUFFEUR POUR RÉPONSE (Response) ───────────────────────────
package com.example.GestionParcAutomobile.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChauffeurResponseDTO {
    
    // Champs hérités de Utilisateur
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String statut;
    private LocalDateTime dateCreation;
    private LocalDateTime derniereConnexion;
    private String adresse;
    private RoleDTO role;
    
    // Champs spécifiques Chauffeur
    private String numeroPermis;
    private String categoriePermis;
    private LocalDate dateExpirationPermis;
    private Boolean disponible;
    private String site;
    private Integer experienceAnnees;
    
    // Champ optionnel pour relation
    private VehiculeDTO vehiculeAttribue;
}

// ─── EXEMPLE DTO CHAUFFEUR POUR REQUÊTE (Request/Create) ──────────────────────
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChauffeurCreateRequestDTO {
    
    private String nom;
    private String prenom;
    private String email;
    private String password;
    private String telephone;
    private String adresse;
    
    // Champs Chauffeur
    private String numeroPermis;
    private String categoriePermis;
    private LocalDate dateExpirationPermis;
    private String site;
    private Integer experienceAnnees;
}

// ─── EXEMPLE DTO CHAUFFEUR POUR MISE À JOUR (Update) ──────────────────────────
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChauffeurUpdateRequestDTO {
    
    // Champs optionnels (null = ne pas modifier)
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String adresse;
    private String statut;
    
    // Champs Chauffeur
    private String numeroPermis;
    private String categoriePermis;
    private LocalDate dateExpirationPermis;
    private Boolean disponible;
    private String site;
    private Integer experienceAnnees;
}

// ─── DTOs auxiliaires ───────────────────────────────────────────────────────────
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleDTO {
    private Long id;
    private String name;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehiculeDTO {
    private Long id;
    private String marque;
    private String modele;
    private String immatriculation;
    private String statut;
}

// ─── UTILISATION DANS LE CONTRÔLEUR ───────────────────────────────────────────
package com.example.GestionParcAutomobile.Controller;

import com.example.GestionParcAutomobile.DTO.*;
import com.example.GestionParcAutomobile.Service.ChauffeurService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/chauffeurs")
@CrossOrigin(origins = "http://localhost:4200")
public class ChauffeurControllerWithDTO {
    
    private ChauffeurService chauffeurService;
    private ChauffeurMapper mapper; // Service pour transformer Entité ↔ DTO
    
    // GET all
    @GetMapping
    public ResponseEntity<List<ChauffeurResponseDTO>> getAllChauffeur() {
        List<Chauffeur> chauffeurs = chauffeurService.findAllChauffeur();
        List<ChauffeurResponseDTO> dtos = chauffeurs.stream()
            .map(mapper::toChauffeurResponseDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    // GET by ID
    @GetMapping("/{id}")
    public ResponseEntity<ChauffeurResponseDTO> getChauffeurById(@PathVariable Long id) {
        Chauffeur chauffeur = chauffeurService.findChauffeurById(id);
        return ResponseEntity.ok(mapper.toChauffeurResponseDTO(chauffeur));
    }
    
    // POST create
    @PostMapping
    public ResponseEntity<ChauffeurResponseDTO> addChauffeur(
            @RequestBody ChauffeurCreateRequestDTO requestDTO) {
        
        // Mapper DTO → Entité
        Chauffeur chauffeur = mapper.toChauffeurEntity(requestDTO);
        
        // Sauvegarder
        Chauffeur saved = chauffeurService.addChauffeur(chauffeur);
        
        // Mapper Entité → DTO
        ChauffeurResponseDTO responseDTO = mapper.toChauffeurResponseDTO(saved);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }
    
    // PUT update
    @PutMapping("/{id}")
    public ResponseEntity<ChauffeurResponseDTO> updateChauffeur(
            @PathVariable Long id,
            @RequestBody ChauffeurUpdateRequestDTO requestDTO) {
        
        // Récupérer l'existant
        Chauffeur existing = chauffeurService.findChauffeurById(id);
        
        // Mapper DTO → Entité (mise à jour partielle)
        mapper.updateChauffeurFromDTO(requestDTO, existing);
        
        // Sauvegarder
        Chauffeur updated = chauffeurService.updateChauffeur(id, existing);
        
        // Mapper Entité → DTO
        ChauffeurResponseDTO responseDTO = mapper.toChauffeurResponseDTO(updated);
        
        return ResponseEntity.ok(responseDTO);
    }
    
    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChauffeur(@PathVariable Long id) {
        chauffeurService.deleteChauffeur(id);
        return ResponseEntity.noContent().build();
    }
}

// ─── MAPPER (MapStruct ou Manuel) ────────────────────────────────────────────────

// Option 1: Avec MapStruct (Recommandé)
// pom.xml: ajouter dépendance MapStruct
@Mapper(componentModel = "spring")
public interface ChauffeurMapper {
    
    ChauffeurResponseDTO toChauffeurResponseDTO(Chauffeur chauffeur);
    
    Chauffeur toChauffeurEntity(ChauffeurCreateRequestDTO dto);
    
    void updateChauffeurFromDTO(ChauffeurUpdateRequestDTO dto, @MappingTarget Chauffeur chauffeur);
}

// Option 2: Manuel
@Component
public class ChauffeurMapperImpl {
    
    public ChauffeurResponseDTO toChauffeurResponseDTO(Chauffeur chauffeur) {
        return ChauffeurResponseDTO.builder()
            .id(chauffeur.getId())
            .nom(chauffeur.getNom())
            .prenom(chauffeur.getPrenom())
            .email(chauffeur.getEmail())
            .telephone(chauffeur.getTelephone())
            .statut(chauffeur.getStatut())
            .dateCreation(chauffeur.getDateCreation())
            .derniereConnexion(chauffeur.getDerniereConnexion())
            .adresse(chauffeur.getAdresse())
            .numeroPermis(chauffeur.getNumeroPermis())
            .categoriePermis(chauffeur.getCategoriePermis())
            .dateExpirationPermis(chauffeur.getDateExpirationPermis())
            .disponible(chauffeur.getDisponible())
            .site(chauffeur.getSite())
            .experienceAnnees(chauffeur.getExperienceAnnees())
            .build();
    }
    
    public Chauffeur toChauffeurEntity(ChauffeurCreateRequestDTO dto) {
        Chauffeur chauffeur = new Chauffeur();
        chauffeur.setNom(dto.getNom());
        chauffeur.setPrenom(dto.getPrenom());
        chauffeur.setEmail(dto.getEmail());
        chauffeur.setPassword(dto.getPassword());
        chauffeur.setTelephone(dto.getTelephone());
        chauffeur.setAdresse(dto.getAdresse());
        chauffeur.setNumeroPermis(dto.getNumeroPermis());
        chauffeur.setCategoriePermis(dto.getCategoriePermis());
        chauffeur.setDateExpirationPermis(dto.getDateExpirationPermis());
        chauffeur.setSite(dto.getSite());
        chauffeur.setExperienceAnnees(dto.getExperienceAnnees());
        chauffeur.setDisponible(true);
        return chauffeur;
    }
}

// ─── AVANTAGES DES DTOs ─────────────────────────────────────────────────────────

/*
1. SÉCURITÉ:
   - Ne pas exposer les champs sensibles (password)
   - Contrôle des données exposées

2. FLEXIBILITÉ:
   - DTOs différents pour create/read/update
   - Données imbriquées/relationnelles

3. VALIDATION:
   - @NotBlank, @Email, @Pattern, etc.
   - Validation au niveau de la requête

4. TRANSFORMATION:
   - Formater les dates
   - Calculer des champs dérivés
   - Mapper les entités

5. API ÉVOLUTION:
   - Ajouter/retirer des champs sans casser le frontend
   - Versioning des APIs
*/

// ─── EXEMPLE: VALIDATION AVEC DTOs ──────────────────────────────────────────────

@Data
public class ChauffeurCreateRequestDTO {
    
    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 2, max = 100, message = "Le nom doit entre 2 et 100 caractères")
    private String nom;
    
    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;
    
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "L'email doit être valide")
    private String email;
    
    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, message = "Le mot de passe doit contenir au minimum 8 caractères")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$",
             message = "Le mot de passe doit contenir: majuscules, minuscules, chiffres, caractères spéciaux")
    private String password;
    
    @Pattern(regexp = "^[0-9]{10}$", message = "Le numéro de téléphone doit contenir 10 chiffres")
    private String telephone;
    
    @NotBlank(message = "Le numéro de permis est obligatoire")
    private String numeroPermis;
    
    @NotBlank(message = "La catégorie de permis est obligatoire")
    @Pattern(regexp = "^[A-E]([1-2])?$", message = "Catégorie de permis invalide")
    private String categoriePermis;
    
    @NotNull(message = "La date d'expiration du permis est obligatoire")
    @Future(message = "La date d'expiration doit être dans le futur")
    private LocalDate dateExpirationPermis;
    
    @Min(value = 0, message = "L'expérience ne peut pas être négative")
    @Max(value = 65, message = "L'expérience dépasse l'âge légal")
    private Integer experienceAnnees;
}

// Utilisation dans le contrôleur:
@PostMapping
public ResponseEntity<ChauffeurResponseDTO> addChauffeur(
        @Valid @RequestBody ChauffeurCreateRequestDTO requestDTO) {
    // requestDTO est automatiquement validé avant d'arriver ici
    // Si invalide, Spring retourne automatiquement un 400 Bad Request
}
