package com.incidents.ms3.utilisateurs.dto;

import jakarta.validation.constraints.NotBlank;

public class EquipeLoginRequest {

    @NotBlank(message = "Le nom de l'equipe est obligatoire")
    private String nom;

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }
}
