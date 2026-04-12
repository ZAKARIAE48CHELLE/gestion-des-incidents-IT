package com.incidents.ms4.equipements.controller;

import com.incidents.ms4.equipements.dto.CategorieDto;
import com.incidents.ms4.equipements.entity.Categorie;
import com.incidents.ms4.equipements.service.CategorieService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
@Tag(name = "Catégories", description = "Gestion des catégories d'équipements")
public class CategorieController {

    @Autowired
    private CategorieService categorieService;

    @PostMapping
    @Operation(summary = "Créer une catégorie", description = "Enregistre une nouvelle catégorie dans le système")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Catégorie créée avec succès"),
            @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    public ResponseEntity<Categorie> create(@Valid @RequestBody CategorieDto dto) {
        return ResponseEntity.status(201).body(categorieService.create(dto));
    }

    @GetMapping
    @Operation(summary = "Lister les catégories", description = "Retourne la liste complète des catégories")
    @ApiResponse(responseCode = "200", description = "Liste retournée avec succès")
    public ResponseEntity<List<Categorie>> getAll() {
        return ResponseEntity.ok(categorieService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'une catégorie", description = "Retourne les informations d'une catégorie par son ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Catégorie trouvée"),
            @ApiResponse(responseCode = "404", description = "Catégorie non trouvée")
    })
    public ResponseEntity<Categorie> getById(@PathVariable Long id) {
        return ResponseEntity.ok(categorieService.findById(id));
    }
}
