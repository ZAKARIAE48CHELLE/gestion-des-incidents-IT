package com.incidents.ms4.equipements.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipementDto {

    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 2, max = 255, message = "Le nom doit contenir entre 2 et 255 caractères")
    private String nom;

    @NotBlank(message = "Le type est obligatoire")
    private String type;

    @NotBlank(message = "La localisation est obligatoire")
    private String localisation;

    @Pattern(regexp = "^([0-9]{1,3}\\.){3}[0-9]{1,3}$",
             message = "L'adresse IP n'est pas valide")
    private String adresseIp;

    @Pattern(regexp = "OPERATIONNEL|EN_PANNE|MAINTENANCE",
             message = "Le statut doit être OPERATIONNEL, EN_PANNE ou MAINTENANCE")
    private String statut;

    @PastOrPresent(message = "La date d'installation ne peut pas être dans le futur")
    private LocalDate dateInstallation;

    @NotNull(message = "La catégorie est obligatoire")
    private Long categorieId;
}
