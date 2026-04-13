package com.incidents.gateway.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.test.EmbeddedKafkaBroker;
import org.springframework.kafka.test.EmbeddedKafkaZKBroker;

@Configuration
public class EmbeddedKafkaConfig {
    private static final Logger log = LoggerFactory.getLogger(EmbeddedKafkaConfig.class);

    @Bean
    public EmbeddedKafkaBroker embeddedKafkaBroker() {
        log.info("==========================================================");
        log.info("DÉMARRAGE DU SERVEUR KAFKA INTÉGRÉ AU LANCEMENT DU GATEWAY");
        log.info("Port utilisé : 9092. (Même port que le Kafka standard!)");
        log.info("==========================================================");
        
        EmbeddedKafkaBroker broker = new EmbeddedKafkaZKBroker(1, false, 1, 
                "incident-events", "affectation-events", "notification-events");
        
        // Expose sur le port standard 9092
        broker.kafkaPorts(9092);
        
        return broker;
    }
}
