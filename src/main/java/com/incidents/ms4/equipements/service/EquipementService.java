package com.incidents.ms4.equipements.service;

import com.incidents.ms4.equipements.dto.EquipementDto;
import com.incidents.ms4.equipements.dto.StatsDto;
import com.incidents.ms4.equipements.entity.Categorie;
import com.incidents.ms4.equipements.entity.Equipement;
import com.incidents.ms4.equipements.entity.StatutEquipement;
import com.incidents.ms4.equipements.repository.CategorieRepository;
import com.incidents.ms4.equipements.repository.EquipementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EquipementService {

    @Autowired
    private EquipementRepository equipementRepository;

    @Autowired
    private CategorieRepository categorieRepository;

    public Equipement create(EquipementDto dto) {
        Categorie categorie = categorieRepository.findById(dto.getCategorieId())
                .orElseThrow(() -> new RuntimeException("Categorie non trouvee avec id : " + dto.getCategorieId()));

        Equipement equipement = new Equipement();
        equipement.setNom(dto.getNom());
        equipement.setType(dto.getType());
        equipement.setLocalisation(dto.getLocalisation());
        equipement.setAdresseIp(dto.getAdresseIp());
        equipement.setDateInstallation(dto.getDateInstallation());
        equipement.setCategorie(categorie);

        if (dto.getStatut() != null) {
            equipement.setStatut(StatutEquipement.valueOf(dto.getStatut()));
        } else {
            equipement.setStatut(StatutEquipement.OPERATIONNEL);
        }

        return equipementRepository.save(equipement);
    }

    public List<Equipement> findAll() {
        return equipementRepository.findAll();
    }

    public Equipement findById(Long id) {
        return equipementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipement non trouve avec id : " + id));
    }

    public boolean existsById(Long id) {
        return equipementRepository.existsById(id);
    }

    public Equipement updateStatut(Long id, String statut) {
        Equipement equipement = equipementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipement non trouve avec id : " + id));
        equipement.setStatut(StatutEquipement.valueOf(statut));
        return equipementRepository.save(equipement);
    }

    public List<Equipement> findByStatut(StatutEquipement statut) {
        return equipementRepository.findByStatut(statut);
    }

    public StatsDto getStats() {
        long total = equipementRepository.count();
        long operationnels = equipementRepository.findByStatut(StatutEquipement.OPERATIONNEL).size();
        long enPanne = equipementRepository.findByStatut(StatutEquipement.EN_PANNE).size();
        long enMaintenance = equipementRepository.findByStatut(StatutEquipement.MAINTENANCE).size();
        long totalCategories = categorieRepository.count();

        double pctOperationnel = total > 0 ? Math.round((operationnels * 100.0 / total) * 10.0) / 10.0 : 0;
        double pctEnPanne = total > 0 ? Math.round((enPanne * 100.0 / total) * 10.0) / 10.0 : 0;
        double pctMaintenance = total > 0 ? Math.round((enMaintenance * 100.0 / total) * 10.0) / 10.0 : 0;

        return new StatsDto(
                total,
                operationnels,
                enPanne,
                enMaintenance,
                totalCategories,
                pctOperationnel,
                pctEnPanne,
                pctMaintenance
        );
    }
}
