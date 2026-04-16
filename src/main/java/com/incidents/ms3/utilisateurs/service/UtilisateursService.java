package com.incidents.ms3.utilisateurs.service;

import com.incidents.ms3.utilisateurs.dto.UtilisateurDto;
import com.incidents.ms3.utilisateurs.entity.Equipe;
import com.incidents.ms3.utilisateurs.entity.Utilisateur;
import com.incidents.ms3.utilisateurs.exception.ResourceNotFoundException;
import com.incidents.ms3.utilisateurs.repository.EquipeRepository;
import com.incidents.ms3.utilisateurs.repository.UtilisateursRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class UtilisateursService {

    private final UtilisateursRepository utilisateursRepository;
    private final EquipeRepository equipeRepository;

    public UtilisateursService(UtilisateursRepository utilisateursRepository,
                               EquipeRepository equipeRepository) {
        this.utilisateursRepository = utilisateursRepository;
        this.equipeRepository = equipeRepository;
    }

    public List<UtilisateurDto> getAllUtilisateurs() {
        return utilisateursRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    public UtilisateurDto getUtilisateurById(Long id) {
        Utilisateur utilisateur = utilisateursRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable avec l'id " + id));
        return toDto(utilisateur);
    }

    public List<UtilisateurDto> getUtilisateursByEquipeId(Long equipeId) {
        return utilisateursRepository.findAllByEquipeId(equipeId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public boolean existsById(Long id) {
        return utilisateursRepository.existsById(id);
    }

    public UtilisateurDto loginByEmail(String email) {
        Utilisateur utilisateur = utilisateursRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Aucun utilisateur trouve avec l'email " + email));
        return toDto(utilisateur);
    }

    public UtilisateurDto createUtilisateur(UtilisateurDto dto) {
        Utilisateur utilisateur = toEntity(dto);
        return toDto(utilisateursRepository.save(utilisateur));
    }

    public UtilisateurDto updateUtilisateur(Long id, UtilisateurDto dto) {
        Utilisateur existing = utilisateursRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable avec l'id " + id));
        existing.setNom(dto.getNom());
        existing.setEmail(dto.getEmail());
        existing.setRole(parseRole(dto.getRole()));
        if (dto.getEquipeId() != null) {
            Equipe equipe = equipeRepository.findById(dto.getEquipeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Equipe introuvable avec l'id " + dto.getEquipeId()));
            existing.setEquipe(equipe);
        }
        return toDto(utilisateursRepository.save(existing));
    }

    public void deleteUtilisateur(Long id) {
        if (!utilisateursRepository.existsById(id)) {
            throw new ResourceNotFoundException("Utilisateur introuvable avec l'id " + id);
        }
        utilisateursRepository.deleteById(id);
    }

    private UtilisateurDto toDto(Utilisateur u) {
        return new UtilisateurDto(
                u.getId(),
                u.getNom(),
                u.getEmail(),
                u.getRole().name(),
                u.getEquipe() != null ? u.getEquipe().getId() : null
        );
    }

    private Utilisateur toEntity(UtilisateurDto dto) {
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setId(dto.getId());
        utilisateur.setNom(dto.getNom());
        utilisateur.setEmail(dto.getEmail());
        utilisateur.setRole(parseRole(dto.getRole()));
        if (dto.getEquipeId() != null) {
            Equipe equipe = equipeRepository.findById(dto.getEquipeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Equipe introuvable avec l'id " + dto.getEquipeId()));
            utilisateur.setEquipe(equipe);
        }
        return utilisateur;
    }

    private Utilisateur.Role parseRole(String role) {
        try {
            return Utilisateur.Role.valueOf(role.trim().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new IllegalArgumentException("Role invalide. Valeurs autorisees: USER, TECHNICIEN, ADMIN");
        }
    }
}
