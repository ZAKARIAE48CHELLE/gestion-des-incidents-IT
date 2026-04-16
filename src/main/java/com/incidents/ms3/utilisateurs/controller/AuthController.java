package com.incidents.ms3.utilisateurs.controller;

import com.incidents.ms3.utilisateurs.dto.EquipeDto;
import com.incidents.ms3.utilisateurs.dto.EquipeLoginRequest;
import com.incidents.ms3.utilisateurs.dto.UtilisateurDto;
import com.incidents.ms3.utilisateurs.dto.UtilisateurLoginRequest;
import com.incidents.ms3.utilisateurs.service.EquipeService;
import com.incidents.ms3.utilisateurs.service.UtilisateursService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UtilisateursService utilisateursService;
    private final EquipeService equipeService;

    public AuthController(UtilisateursService utilisateursService, EquipeService equipeService) {
        this.utilisateursService = utilisateursService;
        this.equipeService = equipeService;
    }

    @PostMapping("/utilisateur")
    public ResponseEntity<UtilisateurDto> loginUtilisateur(@Valid @RequestBody UtilisateurLoginRequest request) {
        return ResponseEntity.ok(utilisateursService.loginByEmail(request.getEmail().trim()));
    }

    @PostMapping("/equipe")
    public ResponseEntity<EquipeDto> loginEquipe(@Valid @RequestBody EquipeLoginRequest request) {
        return ResponseEntity.ok(equipeService.loginByNom(request.getNom().trim()));
    }
}
