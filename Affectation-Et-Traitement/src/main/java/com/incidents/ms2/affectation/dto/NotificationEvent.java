package com.incidents.ms2.affectation.dto;

public class NotificationEvent {
    private String type;
    private Long incidentId;
    private Long acteurId;
    private String statut;

    // ─── Builder ─────────────────────────────────────────────────────────────────

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final NotificationEvent obj = new NotificationEvent();

        public Builder type(String v)       { obj.type = v; return this; }
        public Builder incidentId(Long v)   { obj.incidentId = v; return this; }
        public Builder acteurId(Long v)     { obj.acteurId = v; return this; }
        public Builder statut(String v)     { obj.statut = v; return this; }

        public NotificationEvent build() { return obj; }
    }

    // ─── Getters / Setters ───────────────────────────────────────────────────────

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getIncidentId() { return incidentId; }
    public void setIncidentId(Long incidentId) { this.incidentId = incidentId; }

    public Long getActeurId() { return acteurId; }
    public void setActeurId(Long acteurId) { this.acteurId = acteurId; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
}
