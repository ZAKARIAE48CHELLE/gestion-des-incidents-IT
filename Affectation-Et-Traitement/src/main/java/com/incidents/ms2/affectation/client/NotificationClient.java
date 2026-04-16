package com.incidents.ms2.affectation.client;

import com.incidents.ms2.affectation.dto.NotificationEvent;
import com.incidents.ms2.affectation.simulation.LocalSimulationSupport;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class NotificationClient {

    private final String ms5Url;
    private final RestTemplate restTemplate;
    private final LocalSimulationSupport simulationSupport;

    public NotificationClient(@Value("${ms5.url}") String ms5Url,
                              RestTemplate restTemplate,
                              LocalSimulationSupport simulationSupport) {
        this.ms5Url = ms5Url;
        this.restTemplate = restTemplate;
        this.simulationSupport = simulationSupport;
    }

    /**
     * Sends an event to MS5 — fire-and-forget.
     * Failures are logged but never block the main operation.
     */
    public void sendEvent(NotificationEvent event) {
        if (simulationSupport.isEnabled()) {
            simulationSupport.recordEvent(event);
            return;
        }

        try {
            restTemplate.postForObject(ms5Url + "/api/notifications", event, Void.class);
        } catch (Exception e) {
            System.err.println("[MS2] Échec envoi notification MS5 — type=" + event.getTypeNotification()
                + " | " + e.getMessage());
        }
    }
}
