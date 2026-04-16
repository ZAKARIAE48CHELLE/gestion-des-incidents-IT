package com.incidents.ms3.utilisateurs.repository;

import com.incidents.ms3.utilisateurs.entity.Utilisateur;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UtilisateursRepository extends JpaRepository<Utilisateur, Long> {

    Optional<Utilisateur> findByEmail(String email);
    List<Utilisateur> findAllByEquipeId(Long equipeId);
}
