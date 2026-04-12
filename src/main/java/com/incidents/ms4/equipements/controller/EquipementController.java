package com.incidents.ms4.equipements.controller;

import com.incidents.ms4.equipements.dto.EquipementDto;
import com.incidents.ms4.equipements.dto.StatsDto;
import com.incidents.ms4.equipements.entity.Equipement;
import com.incidents.ms4.equipements.entity.StatutEquipement;
import com.incidents.ms4.equipements.service.EquipementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipements")
@CrossOrigin(origins = "*")
@Tag(name = "Équipements", description = "Gestion des équipements informatiques")
public class EquipementController {

    @Autowired
    private EquipementService equipementService;

    @PostMapping
    @Operation(summary = "Créer un équipement", description = "Enregistre un nouvel équipement dans le système")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Équipement créé avec succès"),
            @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    public ResponseEntity<Equipement> create(@Valid @RequestBody EquipementDto dto) {
        return ResponseEntity.status(201).body(equipementService.create(dto));
    }

    @GetMapping
    @Operation(summary = "Lister les équipements", description = "Retourne la liste complète des équipements")
    @ApiResponse(responseCode = "200", description = "Liste retournée avec succès")
    public ResponseEntity<List<Equipement>> getAll() {
        return ResponseEntity.ok(equipementService.findAll());
    }

    @GetMapping("/stats")
    @Operation(summary = "Statistiques des équipements", description = "Retourne le nombre et pourcentage d'équipements par statut")
    @ApiResponse(responseCode = "200", description = "Statistiques calculées avec succès")
    public ResponseEntity<StatsDto> getStats() {
        return ResponseEntity.ok(equipementService.getStats());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'un équipement", description = "Retourne les informations d'un équipement par son ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Équipement trouvé"),
            @ApiResponse(responseCode = "404", description = "Équipement non trouvé")
    })
    public ResponseEntity<Equipement> getById(
            @Parameter(description = "Identifiant de l'équipement") @PathVariable Long id) {
        return ResponseEntity.ok(equipementService.findById(id));
    }

    @GetMapping("/{id}/exists")
    @Operation(summary = "Vérifier l'existence d'un équipement",
            description = "Endpoint utilisé par MS1 lors de la déclaration d'un incident pour vérifier que l'équipement existe. Retourne true ou false.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Retourne true si l'équipement existe, false sinon")
    })
    public ResponseEntity<Boolean> exists(@PathVariable Long id) {
        return ResponseEntity.ok(equipementService.existsById(id));
    }

    @PutMapping("/{id}/statut")
    @Operation(summary = "Mettre à jour le statut", description = "Change le statut d'un équipement : OPERATIONNEL, EN_PANNE ou MAINTENANCE")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Statut mis à jour"),
            @ApiResponse(responseCode = "404", description = "Équipement non trouvé")
    })
    public ResponseEntity<Equipement> updateStatut(
            @PathVariable Long id,
            @RequestParam String statut) {
        return ResponseEntity.ok(equipementService.updateStatut(id, statut));
    }

    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<Equipement>> getByStatut(@PathVariable String statut) {
        return ResponseEntity.ok(equipementService.findByStatut(StatutEquipement.valueOf(statut)));
    }
}
