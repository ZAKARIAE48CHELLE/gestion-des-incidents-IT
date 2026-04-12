package com.incidents.ms2.affectation.dto;

import java.util.List;

public class SimulationInfoResponse {
    private boolean enabled;
    private List<Long> incidentIds;
    private List<Long> technicianIds;
    private List<NotificationEvent> recentEvents;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public List<Long> getIncidentIds() {
        return incidentIds;
    }

    public void setIncidentIds(List<Long> incidentIds) {
        this.incidentIds = incidentIds;
    }

    public List<Long> getTechnicianIds() {
        return technicianIds;
    }

    public void setTechnicianIds(List<Long> technicianIds) {
        this.technicianIds = technicianIds;
    }

    public List<NotificationEvent> getRecentEvents() {
        return recentEvents;
    }

    public void setRecentEvents(List<NotificationEvent> recentEvents) {
        this.recentEvents = recentEvents;
    }
}
