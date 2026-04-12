package com.incidents.ms3.utilisateurs.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class EquipeDto {

    private Long id;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 100)
    private String nom;

    @Size(max = 100)
    private String responsable;

    @Size(max = 255)
    private String description;

    public EquipeDto() {}

    public EquipeDto(Long id, String nom, String responsable, String description) {
        this.id = id;
        this.nom = nom;
        this.responsable = responsable;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getResponsable() { return responsable; }
    public void setResponsable(String responsable) { this.responsable = responsable; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}