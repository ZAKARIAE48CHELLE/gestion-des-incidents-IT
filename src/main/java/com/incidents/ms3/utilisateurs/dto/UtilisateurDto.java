package com.incidents.ms3.utilisateurs.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UtilisateurDto {

    private Long id;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 100)
    private String nom;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "L'email doit etre valide")
    @Size(max = 150)
    private String email;

    @NotBlank(message = "Le role est obligatoire")
    @Size(max = 50)
    private String role;

    private Long equipeId; // ← ADDED

    public UtilisateurDto() {}

    public UtilisateurDto(Long id, String nom, String email, String role, Long equipeId) {
        this.id = id;
        this.nom = nom;
        this.email = email;
        this.role = role;
        this.equipeId = equipeId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Long getEquipeId() { return equipeId; }
    public void setEquipeId(Long equipeId) { this.equipeId = equipeId; }
}