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

    @JsonProperty("technician_id") 
    private Long technicianId;

    @JsonProperty("type_notification") 
    private String typeNotification; // technician | incident | equipement

    @JsonProperty("message_notification") 
    private String messageNotification;

    @JsonProperty("objet_notification") 
    private String objetNotification;

    @JsonProperty("statut")
    private String action; 

    @JsonProperty("note_cloture")
    private String details;

    private LocalDateTime dateAction = LocalDateTime.now();

    public Historique() {}

    // --- GETTERS ET SETTERS (Indispensables pour corriger les erreurs de compilation) ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIncidentId() { return incidentId; }
    public void setIncidentId(Long incidentId) { this.incidentId = incidentId; }

    public Long getTechnicianId() { return technicianId; }
    public void setTechnicianId(Long technicianId) { this.technicianId = technicianId; }

    public String getTypeNotification() { return typeNotification; }
    public void setTypeNotification(String typeNotification) { this.typeNotification = typeNotification; }

    public String getMessageNotification() { return messageNotification; }
    public void setMessageNotification(String messageNotification) { this.messageNotification = messageNotification; }

    public String getObjetNotification() { return objetNotification; }
    public void setObjetNotification(String objetNotification) { this.objetNotification = objetNotification; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public LocalDateTime getDateAction() { return dateAction; }
    public void setDateAction(LocalDateTime dateAction) { this.dateAction = dateAction; }
}