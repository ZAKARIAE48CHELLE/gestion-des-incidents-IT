package com.incidents.ms5.notifications.controller;

import com.incidents.ms5.notifications.entity.Historique;
import com.incidents.ms5.notifications.service.NotificationsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*") 
public class NotificationsController {

    @Autowired
    private NotificationsService service;

    @GetMapping
    public List<Historique> getAll() {
        return service.getAll();
    }

    @PostMapping("/events")
    public Historique recevoirEvenement(@RequestBody Historique event) {
        return service.enregistrerAction(event);
    }
}