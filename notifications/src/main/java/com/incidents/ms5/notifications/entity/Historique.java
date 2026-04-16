package com.incidents.ms5.notifications.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

@Entity
public class Historique {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonProperty("incident_id")
    private Long incidentId;

    @JsonProperty("statut")
    private String action; 

    @JsonProperty("note_cloture")
    private String details;

    private LocalDateTime dateAction = LocalDateTime.now();

    // Constructeur vide
    public Historique() {}

    // --- GETTERS ET SETTERS MANUELS (Pour supprimer le rouge) ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIncidentId() { return incidentId; }
    public void setIncidentId(Long incidentId) { this.incidentId = incidentId; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public LocalDateTime getDateAction() { return dateAction; }
    public void setDateAction(LocalDateTime dateAction) { this.dateAction = dateAction; }
}