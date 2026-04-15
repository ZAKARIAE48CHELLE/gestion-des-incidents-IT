package com.incidents.ms2.affectation.client;

import com.incidents.ms2.affectation.dto.ValidationResponse;
import com.incidents.ms2.affectation.exception.ServiceUnavailableException;
import com.incidents.ms2.affectation.simulation.LocalSimulationSupport;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

@Component
public class UserClient {

    private final String ms3Url;
    private final RestTemplate restTemplate;
    private final LocalSimulationSupport simulationSupport;

    public UserClient(@Value("${ms3.url}") String ms3Url,
                      RestTemplate restTemplate,
                      LocalSimulationSupport simulationSupport) {
        this.ms3Url = ms3Url;
        this.restTemplate = restTemplate;
        this.simulationSupport = simulationSupport;
    }

    /** Validates that a user/technician exists in MS3. Returns { id, exists }. */
    public ValidationResponse validate(Long userId) {
        if (simulationSupport.isEnabled()) {
            return simulationSupport.validateTechnician(userId);
        }

        try {
            return restTemplate.getForObject(
                ms3Url + "/api/utilisateurs/" + userId + "/validate",
                ValidationResponse.class
            );
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("MS3 (Utilisateurs) indisponible — réessayer plus tard");
        }
    }
}
