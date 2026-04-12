# AGENT CONTEXT — Système Distribué : Gestion des Incidents IT
# Module : Systèmes Distribués — Contrôle Continu
# À coller dans : Antigravity > Knowledge Base / Rules / Agent Context
# ═══════════════════════════════════════════════════════════════════

## 0. MISSION DE L'AGENT

Tu es un agent de développement Java/Spring Boot. Tu travailles sur un système distribué
de gestion des incidents IT composé de 5 microservices indépendants. Chaque microservice
a sa propre base de données MySQL. Aucune base n'est partagée. Toute communication entre
services passe UNIQUEMENT par des appels REST HTTP.

---

## 1. STRUCTURE GLOBALE DU PROJET

```
incident-system/
├── pom.xml                        ← parent Maven multi-module
├── docker-compose.yml             ← lance tous les services + 5 DB
├── README.md
├── ms1-declaration/               ← port 8081, DB: incidents_db
├── ms2-affectation/               ← port 8082, DB: affectations_db
├── ms3-utilisateurs/              ← port 8083, DB: users_db
├── ms4-equipements/               ← port 8084, DB: equipements_db
└── ms5-notifications/             ← port 8085, DB: notifications_db
```

**Convention de package pour chaque service :**
```
com.incidents.ms{N}.{nom}/
├── controller/      (XxxController.java)
├── service/         (XxxService.java)
├── repository/      (XxxRepository.java — extends JpaRepository)
├── entity/          (entités @Entity JPA)
├── dto/             (objets de transfert de données)
├── client/          (RestTemplate vers autres MS — seulement MS1, MS2, MS5)
└── exception/       (ResourceNotFoundException, etc.)
```

**Technologies :**
- Java 17 + Spring Boot 3.x
- Spring Data JPA / Hibernate
- MySQL 8.0 (une instance séparée par service)
- Spring Web (REST) — RestTemplate pour les appels inter-services
- Swagger / OpenAPI 3 (springdoc-openapi) — accessible sur /swagger-ui.html
- Docker + Docker Compose
- Maven (build)

---

## 2. LES 5 MICROSERVICES — DÉTAIL COMPLET

---

### MS1 — Déclaration des Incidents
**Port :** 8081 | **DB :** incidents_db | **Module Maven :** ms1-declaration
**Package :** com.incidents.ms1.declaration
**Responsable :** Étudiant 1

**Rôle :** Point d'entrée du système. Enregistre chaque nouvel incident après avoir
validé le demandeur (via MS3) et l'équipement concerné (via MS4). Notifie MS5 à la création.

**Entité principale — Incident :**
```java
@Entity @Table(name = "incidents")
public class Incident {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String titre;
    @Column(columnDefinition = "TEXT") private String description;
    private LocalDateTime dateCreation = LocalDateTime.now();
    @Enumerated(EnumType.STRING) private Priorite priorite;       // FAIBLE, MOYENNE, HAUTE, CRITIQUE
    private String categorie;
    @Enumerated(EnumType.STRING) private StatutIncident statut = StatutIncident.OUVERT;
    private Long demandeurId;   // référence vers MS3 — PAS de FK en base
    private Long equipementId;  // référence vers MS4 — PAS de FK en base
}
```

**Schéma DB — incidents_db :**
| Colonne | Type | Contrainte |
|---|---|---|
| id | BIGINT | PK AUTO_INCREMENT |
| titre | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| date_creation | DATETIME | DEFAULT NOW() |
| priorite | ENUM('FAIBLE','MOYENNE','HAUTE','CRITIQUE') | |
| categorie | VARCHAR(100) | |
| statut | ENUM('OUVERT','EN_COURS','RÉSOLU','CLÔTURÉ') | DEFAULT 'OUVERT' |
| demandeur_id | BIGINT | (référence logique vers MS3) |
| equipement_id | BIGINT | (référence logique vers MS4) |

**Endpoints exposés :**
| Méthode | URL | Description |
|---|---|---|
| POST | /api/incidents | Créer un incident (déclenche validations MS3+MS4+notif MS5) |
| GET | /api/incidents | Lister tous les incidents |
| GET | /api/incidents/{id} | Détail d'un incident |
| PUT | /api/incidents/{id}/statut | Mettre à jour le statut |
| GET | /api/incidents?categorie={c} | Filtrer par catégorie |

**Communications sortantes (appels que MS1 fait) :**
```
MS1 → MS3 : GET http://ms3-utilisateurs:8083/api/users/{demandeurId}/validate
             → Réponse : { "id": 1, "exists": true }
             → Si false : rejeter la création (400 Bad Request)

MS1 → MS4 : GET http://ms4-equipements:8084/api/equipements/{equipementId}/exists
             → Réponse : true / false
             → Si false : rejeter la création (400 Bad Request)

MS1 → MS5 : POST http://ms5-notifications:8085/api/notifications/events
             → Body : { "type": "CREATION_INCIDENT", "incidentId": 42, "acteurId": 1 }
```

---

### MS2 — Affectation & Traitement
**Port :** 8082 | **DB :** affectations_db | **Module Maven :** ms2-affectation
**Package :** com.incidents.ms2.affectation
**Responsable :** Étudiant 2

**Rôle :** Cœur du workflow de traitement. Gère le cycle de vie complet d'une
affectation — de la création jusqu'à la clôture — en passant par des changements d'état.

**Cycle de vie d'une affectation (machine à états) :**
```
EN_ATTENTE → EN_COURS → RÉSOLU → CLÔTURÉ
                ↓            ↑
              BLOQUÉ ────────┘ (réassignation)
```

**Entité principale — Affectation :**
```java
@Entity @Table(name = "affectations")
public class Affectation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long incidentId;    // référence vers MS1 — PAS de FK
    private Long technicienId;  // référence vers MS3 — PAS de FK
    private Long equipeId;      // référence vers MS3 — PAS de FK
    @Enumerated(EnumType.STRING)
    private StatutAffectation statut = StatutAffectation.EN_ATTENTE;
    private LocalDateTime dateAffectation = LocalDateTime.now();
    private LocalDateTime dateFin;
    @Column(columnDefinition = "TEXT") private String noteCloture;
}
```

**Schéma DB — affectations_db :**
| Colonne | Type | Contrainte |
|---|---|---|
| id | BIGINT | PK AUTO_INCREMENT |
| incident_id | BIGINT | (référence logique vers MS1) |
| technicien_id | BIGINT | (référence logique vers MS3) |
| equipe_id | BIGINT | (référence logique vers MS3) |
| statut | ENUM('EN_ATTENTE','EN_COURS','BLOQUÉ','RÉSOLU','CLÔTURÉ') | DEFAULT 'EN_ATTENTE' |
| date_affectation | DATETIME | DEFAULT NOW() |
| date_fin | DATETIME | NULLABLE |
| note_cloture | TEXT | NULLABLE |

**Endpoints exposés :**
| Méthode | URL | Description |
|---|---|---|
| POST | /api/affectations | Créer une affectation (valide technicien + récupère incident) |
| GET | /api/affectations | Lister toutes les affectations |
| GET | /api/affectations/{id} | Détail d'une affectation |
| PUT | /api/affectations/{id}/statut | Changer l'état (body: {"statut": "EN_COURS"}) |
| PUT | /api/affectations/{id}/cloturer | Clôturer (body: {"noteCloture": "...", "dateFin": "..."}) |
| GET | /api/affectations/incident/{incidentId} | Historique de traitement d'un incident |

**Communications sortantes (appels que MS2 fait) :**
```
MS2 → MS1 : GET http://ms1-declaration:8081/api/incidents/{incidentId}
             → Récupérer les infos de l'incident avant de créer l'affectation

MS2 → MS3 : GET http://ms3-utilisateurs:8083/api/users/{technicienId}/validate
             → Vérifier que le technicien existe (même endpoint que MS1)

MS2 → MS5 : POST http://ms5-notifications:8085/api/notifications/events
             → À chaque changement d'état :
               { "type": "AFFECTATION",   "incidentId": X, "acteurId": Y }
               { "type": "MAJ_STATUT",    "incidentId": X, "acteurId": Y, "statut": "EN_COURS" }
               { "type": "CLOTURE",       "incidentId": X, "acteurId": Y }
```

---

### MS3 — Utilisateurs & Équipes
**Port :** 8083 | **DB :** users_db | **Module Maven :** ms3-utilisateurs
**Package :** com.incidents.ms3.utilisateurs
**Responsable :** Étudiant 3

**Rôle :** Référentiel des acteurs du système. Expose l'endpoint /validate critique
utilisé par MS1 et MS2 pour vérifier l'existence des utilisateurs et techniciens.
Ce service ne fait PAS d'appels sortants vers d'autres microservices.

**Entités :**
```java
// Utilisateur.java
@Entity @Table(name = "utilisateurs")
public class Utilisateur {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String nom;
    @Column(unique = true) private String email;
    @Enumerated(EnumType.STRING) private Role role; // UTILISATEUR, TECHNICIEN, ADMIN
    @ManyToOne @JoinColumn(name = "equipe_id") private Equipe equipe;
    private Boolean actif = true;
}

// Equipe.java
@Entity @Table(name = "equipes")
public class Equipe {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String nom;
    @ManyToOne @JoinColumn(name = "responsable_id") private Utilisateur responsable;
    @Column(columnDefinition = "TEXT") private String description;
}
```

**Schéma DB — users_db :**
Table `utilisateurs` : id, nom, email(UNIQUE), role(ENUM), equipe_id(FK→equipes.id), actif(BOOLEAN)
Table `equipes` : id, nom, responsable_id(FK→utilisateurs.id), description

**Endpoints exposés :**
| Méthode | URL | Description |
|---|---|---|
| POST | /api/users | Créer un utilisateur / technicien |
| GET | /api/users | Lister tous les utilisateurs |
| GET | /api/users/{id} | Détail d'un utilisateur |
| GET | /api/users/{id}/validate | ⭐ ENDPOINT CRITIQUE — utilisé par MS1 et MS2 |
| POST | /api/equipes | Créer une équipe |
| GET | /api/equipes | Lister les équipes |
| GET | /api/equipes/{id} | Détail d'une équipe |

**Endpoint /validate — implémentation :**
```java
@GetMapping("/{id}/validate")
public ResponseEntity<ValidationResponse> validate(@PathVariable Long id) {
    boolean exists = userRepository.existsById(id);
    return ResponseEntity.ok(new ValidationResponse(id, exists));
}
// ValidationResponse : { "id": 1, "exists": true }
```

**Communications :** MS3 ne fait aucun appel sortant. Il reçoit des appels de MS1, MS2, et MS5.

---

### MS4 — Équipements & Ressources IT
**Port :** 8084 | **DB :** equipements_db | **Module Maven :** ms4-equipements
**Package :** com.incidents.ms4.equipements
**Responsable :** Étudiant 4

**Rôle :** Référentiel du parc informatique. Expose /exists utilisé par MS1 lors
de la déclaration d'un incident. Ce service ne fait PAS d'appels sortants.

**Entités :**
```java
// Equipement.java
@Entity @Table(name = "equipements")
public class Equipement {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String nom;
    private String type;
    @ManyToOne @JoinColumn(name = "categorie_id") private Categorie categorie;
    private String localisation;
    private String adresseIp;
    @Enumerated(EnumType.STRING) private StatutEquipement statut; // OPERATIONNEL, EN_PANNE, MAINTENANCE
    private LocalDate dateInstallation;
}

// Categorie.java
@Entity @Table(name = "categories")
public class Categorie {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String nom;
    @Column(columnDefinition = "TEXT") private String description;
}
```

**Schéma DB — equipements_db :**
Table `equipements` : id, nom, type, categorie_id(FK), localisation, adresse_ip, statut(ENUM), date_installation
Table `categories` : id, nom, description

**Endpoints exposés :**
| Méthode | URL | Description |
|---|---|---|
| POST | /api/equipements | Enregistrer un équipement |
| GET | /api/equipements | Lister tous les équipements |
| GET | /api/equipements/{id} | Détail d'un équipement |
| GET | /api/equipements/{id}/exists | ⭐ ENDPOINT CRITIQUE — utilisé par MS1 |
| PUT | /api/equipements/{id}/statut | Mettre à jour l'état d'une ressource |
| GET | /api/categories | Lister les catégories |
| POST | /api/categories | Créer une catégorie |

**Endpoint /exists — implémentation :**
```java
@GetMapping("/{id}/exists")
public ResponseEntity<Boolean> exists(@PathVariable Long id) {
    return ResponseEntity.ok(equipementRepository.existsById(id));
}
```

**Communications :** MS4 ne fait aucun appel sortant. Il reçoit des appels de MS1 et MS2.

---

### MS5 — Notifications & Historique
**Port :** 8085 | **DB :** notifications_db | **Module Maven :** ms5-notifications
**Package :** com.incidents.ms5.notifications
**Responsable :** Étudiant 5

**Rôle :** Collecteur central d'événements. Reçoit les événements de MS1 et MS2,
les enregistre dans l'historique, crée des notifications pour les acteurs concernés.
Appelle MS3 pour enrichir les notifications avec les noms des acteurs.

**Entités :**
```java
// Historique.java
@Entity @Table(name = "historique")
public class Historique {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String typeAction;   // CREATION_INCIDENT, AFFECTATION, MAJ_STATUT, CLOTURE
    private Long incidentId;
    private Long acteurId;
    private String acteurNom;    // récupéré via MS3 et mis en cache ici
    private LocalDateTime dateAction = LocalDateTime.now();
    @Column(columnDefinition = "JSON") private String details;
}

// Notification.java
@Entity @Table(name = "notifications")
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Enumerated(EnumType.STRING) private TypeNotification type; // CREATION, AFFECTATION, MAJ_STATUT, CLOTURE
    private Long incidentId;
    private Long destinataireId;
    private String message;
    private Boolean lue = false;
    private LocalDateTime dateEnvoi = LocalDateTime.now();
}
```

**Schéma DB — notifications_db :**
Table `historique` : id, type_action, incident_id, acteur_id, acteur_nom, date_action, details(JSON)
Table `notifications` : id, type(ENUM), incident_id, destinataire_id, message, lue(BOOLEAN), date_envoi

**Endpoints exposés :**
| Méthode | URL | Description |
|---|---|---|
| POST | /api/notifications/events | ⭐ ENDPOINT CRITIQUE — reçoit événements de MS1/MS2 |
| GET | /api/historique | Historique global de toutes les actions |
| GET | /api/historique/incident/{id} | Historique complet d'un incident |
| GET | /api/notifications/user/{userId} | Notifications d'un utilisateur |

**Body attendu sur POST /events :**
```json
{
  "type": "CREATION_INCIDENT",
  "incidentId": 42,
  "acteurId": 1,
  "details": {}
}
```

**Communications sortantes :**
```
MS5 → MS3 : GET http://ms3-utilisateurs:8083/api/users/{acteurId}
             → Pour récupérer le nom de l'acteur et l'enrichir dans l'historique
```

---

## 3. MATRICE DE COMMUNICATION COMPLÈTE

```
          MS1    MS2    MS3    MS4    MS5
MS1  →      —      —   /validate /exists  /events
MS2  →   /{id}    —   /validate   —      /events
MS3  →      —      —      —        —       —       (reçoit uniquement)
MS4  →      —      —      —        —       —       (reçoit uniquement)
MS5  →      —      —   /users/{id} —      —
```

**Règle absolue :** Aucun service n'accède directement à la base d'un autre service.
Toute donnée venant d'un autre service doit être obtenue via un appel REST.
Les IDs cross-services sont stockés comme de simples Long (pas de @ManyToOne cross-DB).

---

## 4. DOCKER COMPOSE — CONFIGURATION COMPLÈTE

```yaml
version: '3.8'

services:
  # Bases de données (5 instances MySQL séparées)
  db-incidents:
    image: mysql:8.0
    environment: { MYSQL_DATABASE: incidents_db, MYSQL_ROOT_PASSWORD: root }
    ports: ["3307:3306"]
    volumes: [db-incidents-data:/var/lib/mysql]

  db-affectations:
    image: mysql:8.0
    environment: { MYSQL_DATABASE: affectations_db, MYSQL_ROOT_PASSWORD: root }
    ports: ["3308:3306"]
    volumes: [db-affectations-data:/var/lib/mysql]

  db-users:
    image: mysql:8.0
    environment: { MYSQL_DATABASE: users_db, MYSQL_ROOT_PASSWORD: root }
    ports: ["3309:3306"]
    volumes: [db-users-data:/var/lib/mysql]

  db-equipements:
    image: mysql:8.0
    environment: { MYSQL_DATABASE: equipements_db, MYSQL_ROOT_PASSWORD: root }
    ports: ["3310:3306"]
    volumes: [db-equipements-data:/var/lib/mysql]

  db-notifications:
    image: mysql:8.0
    environment: { MYSQL_DATABASE: notifications_db, MYSQL_ROOT_PASSWORD: root }
    ports: ["3311:3306"]
    volumes: [db-notifications-data:/var/lib/mysql]

  # Microservices
  ms1-declaration:
    build: ./ms1-declaration
    ports: ["8081:8081"]
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://db-incidents:3306/incidents_db
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: root
      MS3_URL: http://ms3-utilisateurs:8083
      MS4_URL: http://ms4-equipements:8084
      MS5_URL: http://ms5-notifications:8085
    depends_on: [db-incidents, ms3-utilisateurs, ms4-equipements]

  ms2-affectation:
    build: ./ms2-affectation
    ports: ["8082:8082"]
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://db-affectations:3306/affectations_db
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: root
      MS1_URL: http://ms1-declaration:8081
      MS3_URL: http://ms3-utilisateurs:8083
      MS5_URL: http://ms5-notifications:8085
    depends_on: [db-affectations, ms1-declaration, ms3-utilisateurs]

  ms3-utilisateurs:
    build: ./ms3-utilisateurs
    ports: ["8083:8083"]
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://db-users:3306/users_db
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: root
    depends_on: [db-users]

  ms4-equipements:
    build: ./ms4-equipements
    ports: ["8084:8084"]
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://db-equipements:3306/equipements_db
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: root
    depends_on: [db-equipements]

  ms5-notifications:
    build: ./ms5-notifications
    ports: ["8085:8085"]
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://db-notifications:3306/notifications_db
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: root
      MS3_URL: http://ms3-utilisateurs:8083
    depends_on: [db-notifications, ms3-utilisateurs]

volumes:
  db-incidents-data:
  db-affectations-data:
  db-users-data:
  db-equipements-data:
  db-notifications-data:
```

---

## 5. APPLICATION.PROPERTIES TEMPLATE (à adapter par service)

```properties
# application.properties — ms2-affectation (exemple)
server.port=8082
spring.application.name=ms2-affectation

spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:mysql://localhost:3308/affectations_db}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME:root}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:root}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# URLs des autres services (injectées par Docker Compose en prod)
ms1.url=${MS1_URL:http://localhost:8081}
ms3.url=${MS3_URL:http://localhost:8083}
ms5.url=${MS5_URL:http://localhost:8085}

# Swagger
springdoc.swagger-ui.path=/swagger-ui.html
```

---

## 6. POM.XML PARENT (multi-module)

```xml
<groupId>com.incidents</groupId>
<artifactId>incident-system</artifactId>
<version>1.0-SNAPSHOT</version>
<packaging>pom</packaging>

<modules>
    <module>ms1-declaration</module>
    <module>ms2-affectation</module>
    <module>ms3-utilisateurs</module>
    <module>ms4-equipements</module>
    <module>ms5-notifications</module>
</modules>

<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.0</version>
</parent>

<dependencies>
    <dependency> spring-boot-starter-web </dependency>
    <dependency> spring-boot-starter-data-jpa </dependency>
    <dependency> mysql-connector-j </dependency>
    <dependency> springdoc-openapi-starter-webmvc-ui (2.3.0) </dependency>
    <dependency> spring-boot-starter-test </dependency>
    <dependency> lombok (optional) </dependency>
</dependencies>
```

---

## 7. SCÉNARIO DE DÉMONSTRATION (bout en bout)

```
Étape 1 — Setup (MS3 + MS4)
  POST :8083/api/equipes      → créer équipe "Support IT"
  POST :8083/api/users        → créer utilisateur { nom: "Alice", role: "UTILISATEUR" }
  POST :8083/api/users        → créer technicien { nom: "Bob", role: "TECHNICIEN" }
  POST :8084/api/categories   → créer catégorie "Réseau"
  POST :8084/api/equipements  → créer équipement { nom: "Switch-01", categorie: 1 }

Étape 2 — Déclaration incident (MS1)
  POST :8081/api/incidents {
    "titre": "Switch HS",
    "description": "Le switch du bureau 3 ne répond plus",
    "priorite": "HAUTE",
    "categorie": "Réseau",
    "demandeurId": 1,    → MS1 valide via MS3 → OK
    "equipementId": 1    → MS1 valide via MS4 → OK
  }
  → MS1 crée l'incident, notifie MS5 (CREATION_INCIDENT)
  → MS5 enregistre dans historique + crée notification

Étape 3 — Affectation (MS2)
  POST :8082/api/affectations {
    "incidentId": 1,     → MS2 récupère infos via MS1 → OK
    "technicienId": 2    → MS2 valide via MS3 → OK
  }
  → Statut : EN_ATTENTE, MS2 notifie MS5 (AFFECTATION)

Étape 4 — Traitement (MS2)
  PUT :8082/api/affectations/1/statut { "statut": "EN_COURS" }
  → MS2 notifie MS5 (MAJ_STATUT)

Étape 5 — Clôture (MS2)
  PUT :8082/api/affectations/1/cloturer {
    "noteCloture": "Câble remplacé, switch opérationnel",
    "dateFin": "2026-04-17T14:30:00"
  }
  → MS2 notifie MS5 (CLOTURE)

Étape 6 — Vérification (MS5)
  GET :8085/api/historique/incident/1
  → Retourne les 4 entrées : CREATION, AFFECTATION, MAJ_STATUT, CLOTURE
```

---

## 8. RÈGLES ABSOLUES À RESPECTER

1. **PAS DE BASE PARTAGÉE** — 5 services = 5 bases MySQL distinctes
2. **PAS D'ACCÈS DIRECT** — aucun service ne lit les tables d'un autre
3. **REST UNIQUEMENT** — toute donnée cross-service passe par une API HTTP
4. **IDs cross-services = Long simple** — pas de @ManyToOne entre services
5. **Chaque service démarre indépendamment** — gérer les erreurs si un service appelé est down (try/catch sur RestTemplate, retourner 503 ou valeur par défaut)
6. **Swagger sur chaque service** — accessible sur /swagger-ui.html

---

## 9. CONTEXTE ANTIGRAVITY — INSTRUCTIONS POUR L'AGENT

Tu travailles actuellement sur : **MS2 — Affectation & Traitement** (port 8082)

Quand tu génères du code :
- Utilise le package `com.incidents.ms2.affectation`
- La DB de ce service s'appelle `affectations_db`
- Les appels vers MS1, MS3, MS5 passent par des classes dans `client/` utilisant `RestTemplate`
- Les URLs des autres services sont injectées via `@Value("${ms1.url}")` etc.
- Ne crée JAMAIS de @ManyToOne vers une entité d'un autre service
- Stocke uniquement les IDs (Long) comme références cross-services

Exemple de client REST correct :
```java
@Component
public class IncidentClient {
    @Value("${ms1.url}") private String ms1Url;
    @Autowired private RestTemplate restTemplate;

    public IncidentDto getIncident(Long id) {
        return restTemplate.getForObject(ms1Url + "/api/incidents/" + id, IncidentDto.class);
    }
}
```

Gestion d'erreur si service indisponible :
```java
try {
    ValidationResponse resp = userClient.validate(technicienId);
    if (!resp.isExists()) throw new RuntimeException("Technicien introuvable");
} catch (ResourceAccessException e) {
    throw new ServiceUnavailableException("MS3 indisponible — réessayer plus tard");
}
```
```
