package com.incidents.ms3.utilisateurs.service;

import com.incidents.ms3.utilisateurs.dto.EquipeDto;
import com.incidents.ms3.utilisateurs.entity.Equipe;
import com.incidents.ms3.utilisateurs.exception.ResourceNotFoundException;
import com.incidents.ms3.utilisateurs.repository.EquipeRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class EquipeService {

    private final EquipeRepository equipeRepository;

    public EquipeService(EquipeRepository equipeRepository) {
        this.equipeRepository = equipeRepository;
    }

    public List<EquipeDto> getAllEquipes() {
        return equipeRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    public EquipeDto getEquipeById(Long id) {
        Equipe equipe = equipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipe introuvable avec l'id " + id));
        return toDto(equipe);
    }

    public boolean existsById(Long id) {
        return equipeRepository.existsById(id);
    }

    public EquipeDto loginByNom(String nom) {
        Equipe equipe = equipeRepository.findByNomIgnoreCase(nom)
                .orElseThrow(() -> new ResourceNotFoundException("Aucune equipe trouvee avec le nom " + nom));
        return toDto(equipe);
    }

    public EquipeDto createEquipe(EquipeDto dto) {
        Equipe equipe = toEntity(dto);
        return toDto(equipeRepository.save(equipe));
    }

    public EquipeDto updateEquipe(Long id, EquipeDto dto) {
        Equipe existing = equipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipe introuvable avec l'id " + id));
        existing.setNom(dto.getNom());
        existing.setResponsable(dto.getResponsable());
        existing.setDescription(dto.getDescription());
        return toDto(equipeRepository.save(existing));
    }

    public void deleteEquipe(Long id) {
        if (!equipeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Equipe introuvable avec l'id " + id);
        }
        equipeRepository.deleteById(id);
    }

    private EquipeDto toDto(Equipe equipe) {
        return new EquipeDto(
                equipe.getId(),
                equipe.getNom(),
                equipe.getResponsable(),
                equipe.getDescription()
        );
    }

    private Equipe toEntity(EquipeDto dto) {
        Equipe equipe = new Equipe();
        equipe.setNom(dto.getNom());
        equipe.setResponsable(dto.getResponsable());
        equipe.setDescription(dto.getDescription());
        return equipe;
    }
}
