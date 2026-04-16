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

    public Historique enregistrerAction(Historique event) {
        if (event.getDateAction() == null) {
            event.setDateAction(LocalDateTime.now());
        }
        return repository.save(event);
    }

    public List<Historique> getAll() {
        return repository.findAll();
    }
}