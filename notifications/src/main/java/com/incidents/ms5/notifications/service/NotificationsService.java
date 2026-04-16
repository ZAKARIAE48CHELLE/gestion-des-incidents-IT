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
        Historique h = new Historique();
        // Utilise les noms exacts de tes variables si les setters ne marchent pas
        h.setIncidentId(incidentId);
        h.setAction(action);
        h.setDetails(details);
        h.setDateAction(LocalDateTime.now());
        return repository.save(h);
    }

    public List<Historique> getAll() {
        return repository.findAll();
    }
}