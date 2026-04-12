package com.incidents.ms5.notifications.controller;

import com.incidents.ms5.notifications.entity.Historique;
import com.incidents.ms5.notifications.service.NotificationsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationsController {

    @Autowired
    private NotificationsService service;

    @PostMapping("/event")
    public Historique recevoirEvenement(
            @RequestParam Long incidentId, 
            @RequestParam String action, 
            @RequestParam String details) {
        return service.enregistrerAction(incidentId, action, details);
    }

    @GetMapping("/historique/{incidentId}")
    public List<Historique> voirHistorique(@PathVariable Long incidentId) {
        return service.getHistoriqueParIncident(incidentId);
    }
}