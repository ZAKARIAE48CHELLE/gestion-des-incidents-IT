package com.incidents.ms2.affectation.controller;

import com.incidents.ms2.affectation.dto.SimulationInfoResponse;
import com.incidents.ms2.affectation.simulation.LocalSimulationSupport;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/simulation")
public class SimulationController {

    private final LocalSimulationSupport simulationSupport;

    public SimulationController(LocalSimulationSupport simulationSupport) {
        this.simulationSupport = simulationSupport;
    }

    @GetMapping
    public ResponseEntity<SimulationInfoResponse> getSimulationInfo() {
        SimulationInfoResponse response = new SimulationInfoResponse();
        response.setEnabled(simulationSupport.isEnabled());
        response.setIncidentIds(simulationSupport.getIncidentIds());
        response.setTechnicianIds(simulationSupport.getTechnicianIds());
        response.setRecentEvents(simulationSupport.getRecentEvents());
        return ResponseEntity.ok(response);
    }
}
