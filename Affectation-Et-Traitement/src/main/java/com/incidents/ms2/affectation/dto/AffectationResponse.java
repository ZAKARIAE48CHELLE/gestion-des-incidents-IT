package com.incidents.ms2.affectation.dto;

import com.incidents.ms2.affectation.entity.StatutAffectation;
import java.time.LocalDateTime;

public class AffectationResponse {
    private Long id;
    private Long incidentId;
    private Long technicienId;
    private Long equipeId;
    private StatutAffectation statut;
    private LocalDateTime dateAffectation;
    private LocalDateTime dateFin;
    private String noteCloture;

    // ─── Builder ─────────────────────────────────────────────────────────────────

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final AffectationResponse obj = new AffectationResponse();

        public Builder id(Long v)                       { obj.id = v; return this; }
        public Builder incidentId(Long v)               { obj.incidentId = v; return this; }
        public Builder technicienId(Long v)             { obj.technicienId = v; return this; }
        public Builder equipeId(Long v)                 { obj.equipeId = v; return this; }
        public Builder statut(StatutAffectation v)      { obj.statut = v; return this; }
        public Builder dateAffectation(LocalDateTime v) { obj.dateAffectation = v; return this; }
        public Builder dateFin(LocalDateTime v)         { obj.dateFin = v; return this; }
        public Builder noteCloture(String v)            { obj.noteCloture = v; return this; }

        public AffectationResponse build() { return obj; }
    }

    // ─── Getters ─────────────────────────────────────────────────────────────────

    public Long getId() { return id; }
    public Long getIncidentId() { return incidentId; }
    public Long getTechnicienId() { return technicienId; }
    public Long getEquipeId() { return equipeId; }
    public StatutAffectation getStatut() { return statut; }
    public LocalDateTime getDateAffectation() { return dateAffectation; }
    public LocalDateTime getDateFin() { return dateFin; }
    public String getNoteCloture() { return noteCloture; }
}
