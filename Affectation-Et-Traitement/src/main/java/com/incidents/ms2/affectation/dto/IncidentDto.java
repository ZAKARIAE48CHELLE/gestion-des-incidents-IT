package com.incidents.ms2.affectation.dto;

public class IncidentDto {
    private Long id;
    private String titre;
    private String description;
    private String priorite;
    private String categorie;
    private String statut;
    private Long demandeurId;
    private Long equipementId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriorite() { return priorite; }
    public void setPriorite(String priorite) { this.priorite = priorite; }

    public String getCategorie() { return categorie; }
    public void setCategorie(String categorie) { this.categorie = categorie; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public Long getDemandeurId() { return demandeurId; }
    public void setDemandeurId(Long demandeurId) { this.demandeurId = demandeurId; }

    public Long getEquipementId() { return equipementId; }
    public void setEquipementId(Long equipementId) { this.equipementId = equipementId; }
}
