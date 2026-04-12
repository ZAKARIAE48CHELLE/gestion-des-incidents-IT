package com.incidents.ms2.affectation.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "affectations")
public class Affectation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "incident_id", nullable = false)
    private Long incidentId;

    @Column(name = "technicien_id", nullable = false)
    private Long technicienId;

    @Column(name = "equipe_id")
    private Long equipeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutAffectation statut = StatutAffectation.EN_ATTENTE;

    @Column(name = "date_affectation")
    private LocalDateTime dateAffectation = LocalDateTime.now();

    @Column(name = "date_fin")
    private LocalDateTime dateFin;

    @Column(name = "note_cloture", columnDefinition = "TEXT")
    private String noteCloture;

    // ─── Constructors ────────────────────────────────────────────────────────────

    public Affectation() {}

    // ─── Getters & Setters ───────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIncidentId() { return incidentId; }
    public void setIncidentId(Long incidentId) { this.incidentId = incidentId; }

    public Long getTechnicienId() { return technicienId; }
    public void setTechnicienId(Long technicienId) { this.technicienId = technicienId; }

    public Long getEquipeId() { return equipeId; }
    public void setEquipeId(Long equipeId) { this.equipeId = equipeId; }

    public StatutAffectation getStatut() { return statut; }
    public void setStatut(StatutAffectation statut) { this.statut = statut; }

    public LocalDateTime getDateAffectation() { return dateAffectation; }
    public void setDateAffectation(LocalDateTime dateAffectation) { this.dateAffectation = dateAffectation; }

    public LocalDateTime getDateFin() { return dateFin; }
    public void setDateFin(LocalDateTime dateFin) { this.dateFin = dateFin; }

    public String getNoteCloture() { return noteCloture; }
    public void setNoteCloture(String noteCloture) { this.noteCloture = noteCloture; }
}
