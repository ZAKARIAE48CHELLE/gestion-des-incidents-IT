package com.incidents.ms3.utilisateurs.controller;

import com.incidents.ms3.utilisateurs.dto.UtilisateurDto;
import com.incidents.ms3.utilisateurs.service.UtilisateursService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/utilisateurs")
public class UtilisateursController {

    private final UtilisateursService utilisateursService;

    public UtilisateursController(UtilisateursService utilisateursService) {
        this.utilisateursService = utilisateursService;
    }

    @PostMapping
    public ResponseEntity<UtilisateurDto> createUtilisateur(@Valid @RequestBody UtilisateurDto dto) {
        UtilisateurDto created = utilisateursService.createUtilisateur(dto);
        return ResponseEntity.created(URI.create("/api/utilisateurs/" + created.getId())).body(created);
    }

    @GetMapping
    public ResponseEntity<List<UtilisateurDto>> getAllUtilisateurs() {
        return ResponseEntity.ok(utilisateursService.getAllUtilisateurs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UtilisateurDto> getUtilisateurById(@PathVariable Long id) {
        return ResponseEntity.ok(utilisateursService.getUtilisateurById(id));
    }

    // ✅ KEY ENDPOINT — called by MS1 and MS2
    @GetMapping("/{id}/validate")
    public ResponseEntity<Map<String, Object>> validate(@PathVariable Long id) {
        boolean exists = utilisateursService.existsById(id);
        if (exists) {
            UtilisateurDto u = utilisateursService.getUtilisateurById(id);
            return ResponseEntity.ok(Map.of(
                    "exists", true,
                    "id", u.getId(),
                    "nom", u.getNom(),
                    "role", u.getRole()
            ));
        } else {
            return ResponseEntity.ok(Map.of("exists", false));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<UtilisateurDto> updateUtilisateur(@PathVariable Long id,
                                                            @Valid @RequestBody UtilisateurDto dto) {
        return ResponseEntity.ok(utilisateursService.updateUtilisateur(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUtilisateur(@PathVariable Long id) {
        utilisateursService.deleteUtilisateur(id);
        return ResponseEntity.noContent().build();
    }
}