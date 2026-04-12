package com.incidents.ms5.notifications.repository;

import com.incidents.ms5.notifications.entity.Historique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HistoriqueRepository extends JpaRepository<Historique, Long> {
    List<Historique> findByIncidentId(Long incidentId);
}