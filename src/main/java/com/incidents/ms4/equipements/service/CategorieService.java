package com.incidents.ms4.equipements.service;

import com.incidents.ms4.equipements.dto.CategorieDto;
import com.incidents.ms4.equipements.entity.Categorie;
import com.incidents.ms4.equipements.repository.CategorieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CategorieService {

    @Autowired
    private CategorieRepository categorieRepository;

    public Categorie create(CategorieDto dto) {
        Categorie categorie = new Categorie();
        categorie.setNom(dto.getNom());
        categorie.setDescription(dto.getDescription());
        return categorieRepository.save(categorie);
    }

    public List<Categorie> findAll() {
        return categorieRepository.findAll();
    }

    public Categorie findById(Long id) {
        return categorieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categorie non trouvee avec id : " + id));
    }
}
