package com.incidents.ms2.affectation.simulation;

import com.incidents.ms2.affectation.dto.IncidentDto;
import com.incidents.ms2.affectation.dto.NotificationEvent;
import com.incidents.ms2.affectation.dto.ValidationResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;

@Component
public class LocalSimulationSupport {

    private final boolean enabled;
    private final Set<Long> incidentIds;
    private final Set<Long> technicianIds;
    private final LinkedList<NotificationEvent> recentEvents = new LinkedList<>();

    public LocalSimulationSupport(
            @Value("${app.simulation.enabled:true}") boolean enabled,
            @Value("${app.simulation.incident-ids:1,2,3,7,42}") String incidentIds,
            @Value("${app.simulation.technician-ids:2,3,5,8}") String technicianIds) {
        this.enabled = enabled;
        this.incidentIds = parseIds(incidentIds);
        this.technicianIds = parseIds(technicianIds);
    }

    public boolean isEnabled() {
        return enabled;
    }

    public IncidentDto getIncident(Long id) {
        if (!incidentIds.contains(id)) {
            return null;
        }

        IncidentDto dto = new IncidentDto();
        dto.setId(id);
        dto.setTitre("Incident simule #" + id);
        dto.setDescription("Simulation locale MS2 sans dependance a MS1.");
        dto.setPriorite(id % 2 == 0 ? "HAUTE" : "MOYENNE");
        dto.setCategorie(id % 2 == 0 ? "Reseau" : "Poste de travail");
        dto.setStatut("OUVERT");
        dto.setDemandeurId(100L + id);
        dto.setEquipementId(200L + id);
        return dto;
    }

    public ValidationResponse validateTechnician(Long userId) {
        ValidationResponse response = new ValidationResponse();
        response.setId(userId);
        response.setExists(technicianIds.contains(userId));
        return response;
    }

    public synchronized void recordEvent(NotificationEvent event) {
        NotificationEvent snapshot = NotificationEvent.builder()
                .type(event.getType())
                .incidentId(event.getIncidentId())
                .acteurId(event.getActeurId())
                .statut(event.getStatut())
                .build();

        recentEvents.addFirst(snapshot);
        while (recentEvents.size() > 12) {
            recentEvents.removeLast();
        }
    }

    public List<Long> getIncidentIds() {
        return new ArrayList<>(incidentIds);
    }

    public List<Long> getTechnicianIds() {
        return new ArrayList<>(technicianIds);
    }

    public synchronized List<NotificationEvent> getRecentEvents() {
        return new ArrayList<>(recentEvents);
    }

    private Set<Long> parseIds(String rawIds) {
        Set<Long> parsed = new LinkedHashSet<>();
        for (String token : rawIds.split(",")) {
            String value = token.trim();
            if (!value.isEmpty()) {
                parsed.add(Long.parseLong(value));
            }
        }
        return parsed;
    }
}
