package com.incidents.ms3.utilisateurs.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "equipes")
public class Equipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nom;

    private String responsable;

    private String description;

    public Equipe() {}

    public Equipe(Long id, String nom, String responsable, String description) {
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