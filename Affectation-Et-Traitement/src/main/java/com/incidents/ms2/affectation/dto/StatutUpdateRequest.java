package com.incidents.ms2.affectation.dto;

import com.incidents.ms2.affectation.entity.StatutAffectation;

public class StatutUpdateRequest {
    private StatutAffectation statut;

    public StatutAffectation getStatut() { return statut; }
    public void setStatut(StatutAffectation statut) { this.statut = statut; }
}
