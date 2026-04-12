package com.incidents.ms2.affectation.controller;

import com.incidents.ms2.affectation.dto.*;
import com.incidents.ms2.affectation.service.AffectationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/affectations")
@Tag(name = "Affectations", description = "MS2 — Gestion des affectations et du traitement des incidents IT")
public class AffectationController {

    private final AffectationService service;

    public AffectationController(AffectationService service) {
        this.service = service;
    }

    @PostMapping
    @Operation(
        summary = "Créer une affectation",
        description = "Valide le technicien (MS3) et récupère l'incident (MS1). Statut initial : EN_ATTENTE."
    )
    public ResponseEntity<AffectationResponse> create(@RequestBody AffectationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @GetMapping
    @Operation(summary = "Lister toutes les affectations")
    public ResponseEntity<List<AffectationResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/incidents/a-affecter")
    @Operation(summary = "Obtenir les incidents à affecter (EN_PANNE) depuis MS1")
    public ResponseEntity<List<IncidentDto>> getIncidentsOuverts() {
        return ResponseEntity.ok(service.getIncidentsToAssign());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir une affectation par ID")
    public ResponseEntity<AffectationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}/statut")
    @Operation(
        summary = "Changer le statut",
        description = "Transitions : EN_ATTENTE→EN_COURS, EN_COURS→RESOLU|BLOQUE, BLOQUE→EN_COURS"
    )
    public ResponseEntity<AffectationResponse> updateStatut(
            @PathVariable Long id,
            @RequestBody StatutUpdateRequest request) {
        return ResponseEntity.ok(service.updateStatut(id, request));
    }

    @PutMapping("/{id}/cloturer")
    @Operation(
        summary = "Clôturer une affectation",
        description = "Passe à CLOTURE, enregistre note et date de fin. Notifie MS5."
    )
    public ResponseEntity<AffectationResponse> cloturer(
            @PathVariable Long id,
            @RequestBody ClotureRequest request) {
        return ResponseEntity.ok(service.cloturer(id, request));
    }

    @GetMapping("/incident/{incidentId}")
    @Operation(summary = "Historique de traitement d'un incident")
    public ResponseEntity<List<AffectationResponse>> getByIncident(@PathVariable Long incidentId) {
        return ResponseEntity.ok(service.getByIncident(incidentId));
    }
}
