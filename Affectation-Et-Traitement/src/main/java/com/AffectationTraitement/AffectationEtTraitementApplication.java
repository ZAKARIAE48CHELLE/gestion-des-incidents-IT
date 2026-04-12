package com.AffectationTraitement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.incidents.ms2.affectation")
@EnableJpaRepositories(basePackages = "com.incidents.ms2.affectation.repository")
@EntityScan(basePackages = "com.incidents.ms2.affectation.entity")
public class AffectationEtTraitementApplication {

    public static void main(String[] args) {
        SpringApplication.run(AffectationEtTraitementApplication.class, args);
    }
}
