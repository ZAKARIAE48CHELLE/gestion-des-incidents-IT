package com.incidents.ms2.affectation.client;

import com.incidents.ms2.affectation.dto.IncidentDto;
import com.incidents.ms2.affectation.exception.ServiceUnavailableException;
import com.incidents.ms2.affectation.simulation.LocalSimulationSupport;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

@Component
public class IncidentClient {

    private final String ms1Url;
    private final RestTemplate restTemplate;
    private final LocalSimulationSupport simulationSupport;

    public IncidentClient(@Value("${ms1.url}") String ms1Url,
                          RestTemplate restTemplate,
                          LocalSimulationSupport simulationSupport) {
        this.ms1Url = ms1Url;
        this.restTemplate = restTemplate;
        this.simulationSupport = simulationSupport;
    }

    /** Fetch incident details from MS1. Returns null if incident does not exist (404). */
    public IncidentDto getIncident(Long id) {
        if (simulationSupport.isEnabled()) {
            return simulationSupport.getIncident(id);
        }

        try {
            return restTemplate.getForObject(ms1Url + "/api/incidents/" + id, IncidentDto.class);
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("MS1 (Déclaration) indisponible — réessayer plus tard");
        }
    }
}
