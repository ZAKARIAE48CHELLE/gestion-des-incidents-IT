package com.incidents.ms4.equipements.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "equipements")
public class Equipement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;

    private String type;

    private String localisation;

    @Column(name = "adresse_ip")
    private String adresseIp;

    @Enumerated(EnumType.STRING)
    private StatutEquipement statut = StatutEquipement.OPERATIONNEL;

    @Column(name = "date_installation")
    private LocalDate dateInstallation;

    @ManyToOne
    @JoinColumn(name = "categorie_id")
    private Categorie categorie;
}
