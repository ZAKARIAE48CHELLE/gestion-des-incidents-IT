package com.incidents.ms2.affectation.service;

import com.incidents.ms2.affectation.client.IncidentClient;
import com.incidents.ms2.affectation.client.NotificationClient;
import com.incidents.ms2.affectation.client.UserClient;
import com.incidents.ms2.affectation.dto.*;
import com.incidents.ms2.affectation.entity.Affectation;
import com.incidents.ms2.affectation.entity.StatutAffectation;
import com.incidents.ms2.affectation.exception.ResourceNotFoundException;
import com.incidents.ms2.affectation.repository.AffectationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AffectationService {

    private final AffectationRepository repository;
    private final IncidentClient incidentClient;
    private final UserClient userClient;
    private final NotificationClient notificationClient;

    public AffectationService(AffectationRepository repository,
                              IncidentClient incidentClient,
                              UserClient userClient,
                              NotificationClient notificationClient) {
        this.repository = repository;
        this.incidentClient = incidentClient;
        this.userClient = userClient;
        this.notificationClient = notificationClient;
    }

    // ─── CREATE ─────────────────────────────────────────────────────────────────

    public AffectationResponse create(AffectationRequest request) {
        // 1. Verify incident exists in MS1
        IncidentDto incident = incidentClient.getIncident(request.getIncidentId());
        if (incident == null || incident.getId() == null) {
            throw new ResourceNotFoundException("Incident #" + request.getIncidentId() + " introuvable dans MS1");
        }

        // 2. Verify technician exists in MS3
        ValidationResponse validation = userClient.validate(request.getTechnicienId());
        if (validation == null || !validation.isExists()) {
            throw new ResourceNotFoundException("Technicien #" + request.getTechnicienId() + " introuvable dans MS3");
        }

        // 3. Persist
        Affectation affectation = new Affectation();
        affectation.setIncidentId(request.getIncidentId());
        affectation.setIncidentTitre(incident.getTitre());
        affectation.setDescription(incident.getDescription());
        affectation.setEquipementId(incident.getEquipementId());
        affectation.setTechnicienId(request.getTechnicienId());
        affectation.setEquipeId(request.getEquipeId());
        affectation.setStatut(StatutAffectation.EN_ATTENTE);
        affectation.setDateAffectation(LocalDateTime.now());

        Affectation saved = repository.save(affectation);

        // 4. Notify MS5 (non-blocking)
        notificationClient.sendEvent(NotificationEvent.builder()
                .type("AFFECTATION")
                .incidentId(saved.getIncidentId())
                .acteurId(saved.getTechnicienId())
                .build());

        return toResponse(saved);
    }

    // ─── READ ────────────────────────────────────────────────────────────────────

    public List<IncidentDto> getIncidentsToAssign() {
        List<IncidentDto> incidents = incidentClient.getPanneIncidents();
        
        // Récupérer les IDs des incidents déjà affectés dans MS2
        java.util.Set<Long> affectedIds = repository.findAll().stream()
                .map(Affectation::getIncidentId)
                .collect(Collectors.toSet());
                
        // Ne renvoyer que les incidents non affectés
        return incidents.stream()
                .filter(i -> !affectedIds.contains(i.getId()))
                .collect(Collectors.toList());
    }

    public List<AffectationResponse> getAll() {
        return repository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public AffectationResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    public List<AffectationResponse> getByIncident(Long incidentId) {
        return repository.findByIncidentId(incidentId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ─── UPDATE STATUS ───────────────────────────────────────────────────────────

    public AffectationResponse updateStatut(Long id, StatutUpdateRequest request) {
        Affectation affectation = findOrThrow(id);
        validateTransition(affectation.getStatut(), request.getStatut());

        affectation.setStatut(request.getStatut());
        Affectation saved = repository.save(affectation);

        notificationClient.sendEvent(NotificationEvent.builder()
                .type("MAJ_STATUT")
                .incidentId(saved.getIncidentId())
                .acteurId(saved.getTechnicienId())
                .statut(saved.getStatut().name())
                .build());

        return toResponse(saved);
    }

    // ─── CLOSE ───────────────────────────────────────────────────────────────────

    public AffectationResponse cloturer(Long id, ClotureRequest request) {
        Affectation affectation = findOrThrow(id);

        if (affectation.getStatut() == StatutAffectation.CLOTURE) {
            throw new IllegalStateException("Cette affectation est déjà clôturée.");
        }

        affectation.setStatut(StatutAffectation.CLOTURE);
        affectation.setNoteCloture(request.getNoteCloture());
        affectation.setDateFin(request.getDateFin() != null ? request.getDateFin() : LocalDateTime.now());

        Affectation saved = repository.save(affectation);

        notificationClient.sendEvent(NotificationEvent.builder()
                .type("CLOTURE")
                .incidentId(saved.getIncidentId())
                .acteurId(saved.getTechnicienId())
                .build());

        return toResponse(saved);
    }

    // ─── HELPERS ─────────────────────────────────────────────────────────────────

    private Affectation findOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Affectation #" + id + " introuvable"));
    }

    /**
     * State machine:
     *   EN_ATTENTE → EN_COURS
     *   EN_COURS   → RESOLU | BLOQUE
     *   BLOQUE     → EN_COURS  (reassignment)
     *   RESOLU     → CLOTURE   (use /cloturer endpoint)
     *   CLOTURE    → (terminal)
     */
    private void validateTransition(StatutAffectation from, StatutAffectation to) {
        boolean valid = switch (from) {
            case EN_ATTENTE -> to == StatutAffectation.EN_COURS;
            case EN_COURS   -> to == StatutAffectation.RESOLU || to == StatutAffectation.BLOQUE;
            case BLOQUE     -> to == StatutAffectation.EN_COURS;
            case RESOLU     -> to == StatutAffectation.CLOTURE;
            case CLOTURE    -> false;
        };

        if (!valid) {
            throw new IllegalStateException(
                "Transition invalide : " + from + " → " + to + ". " +
                "Autorisé : EN_ATTENTE→EN_COURS, EN_COURS→RESOLU|BLOQUE, BLOQUE→EN_COURS. " +
                "Pour clôturer, utilisez PUT /api/affectations/{id}/cloturer."
            );
        }
    }

    private AffectationResponse toResponse(Affectation a) {
        return AffectationResponse.builder()
                .id(a.getId())
                .incidentId(a.getIncidentId())
                .incidentTitre(a.getIncidentTitre())
                .description(a.getDescription())
                .equipementId(a.getEquipementId())
                .technicienId(a.getTechnicienId())
                .equipeId(a.getEquipeId())
                .statut(a.getStatut())
                .dateAffectation(a.getDateAffectation())
                .dateFin(a.getDateFin())
                .noteCloture(a.getNoteCloture())
                .build();
    }
}
