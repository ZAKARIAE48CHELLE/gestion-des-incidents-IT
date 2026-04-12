package com.incidents.ms3.utilisateurs.controller;

import com.incidents.ms3.utilisateurs.dto.EquipeDto;
import com.incidents.ms3.utilisateurs.service.EquipeService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/equipes")
public class EquipeController {

    private final EquipeService equipeService;

    public EquipeController(EquipeService equipeService) {
        this.equipeService = equipeService;
    }

    @PostMapping
    public ResponseEntity<EquipeDto> createEquipe(@Valid @RequestBody EquipeDto dto) {
        EquipeDto created = equipeService.createEquipe(dto);
        return ResponseEntity.created(URI.create("/api/equipes/" + created.getId())).body(created);
    }

    @GetMapping
    public ResponseEntity<List<EquipeDto>> getAllEquipes() {
        return ResponseEntity.ok(equipeService.getAllEquipes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipeDto> getEquipeById(@PathVariable Long id) {
        return ResponseEntity.ok(equipeService.getEquipeById(id));
    }

    // ✅ KEY ENDPOINT — called by MS2 to verify team exists
    @GetMapping("/{id}/exists")
    public ResponseEntity<Boolean> exists(@PathVariable Long id) {
        return ResponseEntity.ok(equipeService.existsById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EquipeDto> updateEquipe(@PathVariable Long id,
                                                  @Valid @RequestBody EquipeDto dto) {
        return ResponseEntity.ok(equipeService.updateEquipe(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEquipe(@PathVariable Long id) {
        equipeService.deleteEquipe(id);
        return ResponseEntity.noContent().build();
    }
}