package com.incidents.ms4.equipements.repository;

import com.incidents.ms4.equipements.entity.Equipement;
import com.incidents.ms4.equipements.entity.StatutEquipement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EquipementRepository extends JpaRepository<Equipement, Long> {

    List<Equipement> findByStatut(StatutEquipement statut);
}
