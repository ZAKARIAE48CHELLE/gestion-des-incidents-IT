package com.incidents.ms4.equipements.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatsDto {
    private long totalEquipements;
    private long operationnels;
    private long enPanne;
    private long enMaintenance;
    private long totalCategories;
    private double pourcentageOperationnel;
    private double pourcentageEnPanne;
    private double pourcentageMaintenance;
}
