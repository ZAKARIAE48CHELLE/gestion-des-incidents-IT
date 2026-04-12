package com.incidents.ms3.utilisateurs.repository;

import com.incidents.ms3.utilisateurs.entity.Equipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipeRepository extends JpaRepository<Equipe, Long> {
    boolean existsByNom(String nom);
}