package com.incidents.ms2.affectation.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class NotificationEvent {
    @JsonProperty("type_notification")
    private String typeNotification;

    @JsonProperty("incident_id")
    private Long incidentId;

    @JsonProperty("technician_id")
    private Long technicianId;

    @JsonProperty("statut")
    private String statut;

    @JsonProperty("message_notification")
    private String messageNotification;

    @JsonProperty("objet_notification")
    private String objetNotification;

    // ─── Builder ─────────────────────────────────────────────────────────────────

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final NotificationEvent obj = new NotificationEvent();

        public Builder typeNotification(String v)       { obj.typeNotification = v; return this; }
        public Builder incidentId(Long v)               { obj.incidentId = v; return this; }
        public Builder technicianId(Long v)             { obj.technicianId = v; return this; }
        public Builder statut(String v)                 { obj.statut = v; return this; }
        public Builder messageNotification(String v)    { obj.messageNotification = v; return this; }
        public Builder objetNotification(String v)      { obj.objetNotification = v; return this; }

        public NotificationEvent build() { return obj; }
    }

    // ─── Getters / Setters ───────────────────────────────────────────────────────

    public String getTypeNotification() { return typeNotification; }
    public void setTypeNotification(String typeNotification) { this.typeNotification = typeNotification; }

    public Long getIncidentId() { return incidentId; }
    public void setIncidentId(Long incidentId) { this.incidentId = incidentId; }

    public Long getTechnicianId() { return technicianId; }
    public void setTechnicianId(Long technicianId) { this.technicianId = technicianId; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public String getMessageNotification() { return messageNotification; }
    public void setMessageNotification(String messageNotification) { this.messageNotification = messageNotification; }

    public String getObjetNotification() { return objetNotification; }
    public void setObjetNotification(String objetNotification) { this.objetNotification = objetNotification; }
}
