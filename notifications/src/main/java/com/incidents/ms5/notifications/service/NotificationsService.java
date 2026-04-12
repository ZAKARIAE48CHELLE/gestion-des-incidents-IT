package com.incidents.ms5.notifications.service;

import com.incidents.ms5.notifications.entity.Historique;
import com.incidents.ms5.notifications.repository.HistoriqueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationsService {
    
    @Autowired
    private HistoriqueRepository repository;

    public Historique enregistrerAction(Long incidentId, String action, String details) {
        // Correction ici : on passe juste 'null' sans le libellé 'id:'
        Historique h = new Historique(null, incidentId, action, details, LocalDateTime.now());
        return repository.save(h);
    }

    public List<Historique> getHistoriqueParIncident(Long id) {
        return repository.findByIncidentId(id);
    }
}