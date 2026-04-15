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


        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("ngrok-skip-browser-warning", "69420");
            org.springframework.http.HttpEntity<Void> entity = new org.springframework.http.HttpEntity<>(headers);
            
            org.springframework.http.ResponseEntity<IncidentDto> response = restTemplate.exchange(
                    ms1Url + "/api/incidents/" + id,
                    org.springframework.http.HttpMethod.GET,
                    entity,
                    IncidentDto.class
            );
            return response.getBody();
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("MS1 (Déclaration) indisponible — réessayer plus tard");
        }
    }

    /** Fetch all open incidents from MS1. */
    public java.util.List<IncidentDto> getPanneIncidents() {


        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("ngrok-skip-browser-warning", "69420");
            org.springframework.http.HttpEntity<Void> entity = new org.springframework.http.HttpEntity<>(headers);
            
            org.springframework.http.ResponseEntity<IncidentDto[]> response = restTemplate.exchange(
                    ms1Url + "/api/incidents",
                    org.springframework.http.HttpMethod.GET,
                    entity,
                    IncidentDto[].class
            );
            IncidentDto[] incidents = response.getBody();
            if (incidents == null) return java.util.Collections.emptyList();
            
            return java.util.Arrays.stream(incidents)
                    .filter(i -> "EN_PANNE".equals(i.getStatut()))
                    .collect(java.util.stream.Collectors.toList())
                    // .isEmpty("Aucun incident en panne trouvé")
                    ;
        } catch (ResourceAccessException e) {
            throw new ServiceUnavailableException("MS1 (Déclaration) indisponible — réessayer plus tard");
        }
    }

    /** Update incident state to EN_COURS in MS1 when assigned in MS2. */
    public void updateIncidentToAffectee(Long id) {
        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("ngrok-skip-browser-warning", "69420");
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            
            // MS1 expects a JSON body: {"statut": "EN_COURS"}
            String requestBody = "{\"statut\":\"EN_COURS\"}";
            
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(requestBody, headers);
            
            restTemplate.exchange(
                    ms1Url + "/api/incidents/" + id + "/statut",
                    org.springframework.http.HttpMethod.PUT,
                    entity,
                    String.class
            );
            System.out.println("✅ Succès: l'incident #" + id + " est passé en EN_COURS dans MS1 !");
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            System.err.println("❌ Erreur MS1 - Http status: " + e.getStatusCode());
            System.err.println("❌ Erreur MS1 - Body response: " + e.getResponseBodyAsString());
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("❌ Erreur inattendue dans MS1 : " + e.getMessage());
            e.printStackTrace();
        }
    }
}
