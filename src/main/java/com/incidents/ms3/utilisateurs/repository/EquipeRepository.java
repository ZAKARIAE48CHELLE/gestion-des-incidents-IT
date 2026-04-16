package com.incidents.ms3.utilisateurs.repository;

import com.incidents.ms3.utilisateurs.entity.Equipe;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipeRepository extends JpaRepository<Equipe, Long> {
    boolean existsByNom(String nom);
    Optional<Equipe> findByNomIgnoreCase(String nom);
}
