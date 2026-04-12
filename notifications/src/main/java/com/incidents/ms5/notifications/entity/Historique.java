package com.incidents.ms5.notifications.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data 
public class Historique {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long incidentId;
    private String action; 
    private String details;
    private LocalDateTime dateAction;

    // Ajoute ce bloc manuellement pour corriger l'erreur du "new"
    public Historique() {}

    public Historique(Long id, Long incidentId, String action, String details, LocalDateTime dateAction) {
        this.id = id;
        this.incidentId = incidentId;
        this.action = action;
        this.details = details;
        this.dateAction = dateAction;
    }
}