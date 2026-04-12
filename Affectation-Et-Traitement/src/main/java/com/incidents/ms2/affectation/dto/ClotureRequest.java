package com.incidents.ms2.affectation.dto;

import java.time.LocalDateTime;

public class ClotureRequest {
    private String noteCloture;
    private LocalDateTime dateFin;

    public String getNoteCloture() { return noteCloture; }
    public void setNoteCloture(String noteCloture) { this.noteCloture = noteCloture; }

    public LocalDateTime getDateFin() { return dateFin; }
    public void setDateFin(LocalDateTime dateFin) { this.dateFin = dateFin; }
}
