package com.incidents.ms2.affectation.repository;

import com.incidents.ms2.affectation.entity.Affectation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AffectationRepository extends JpaRepository<Affectation, Long> {

    List<Affectation> findByIncidentId(Long incidentId);
}
