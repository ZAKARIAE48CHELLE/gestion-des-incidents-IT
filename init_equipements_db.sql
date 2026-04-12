-- 1. Création de la base de données
CREATE DATABASE equipements_db;

-- 2. Se connecter à equipements_db puis créer la table categories
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    description TEXT
);

-- 3. Créer la table equipements
CREATE TABLE IF NOT EXISTS equipements (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    localisation VARCHAR(255),
    adresse_ip VARCHAR(50),
    statut VARCHAR(20) DEFAULT 'OPERATIONNEL' 
        CHECK (statut IN ('OPERATIONNEL', 'EN_PANNE', 'MAINTENANCE')),
    date_installation DATE,
    categorie_id BIGINT REFERENCES categories(id)
);

-- 4. Insérer 4 catégories de test
INSERT INTO categories (nom, description) VALUES
('Réseau', 'Équipements réseau : switches, routeurs, points d accès'),
('Serveur', 'Serveurs physiques et virtuels'),
('Poste de travail', 'Ordinateurs de bureau et laptops'),
('Imprimante', 'Imprimantes et scanners');

-- 5. Insérer 6 équipements de test
INSERT INTO equipements (nom, type, localisation, adresse_ip, statut, date_installation, categorie_id) VALUES
('Switch-Salle-A', 'Switch 24 ports', 'Salle A - Armoire 1', '192.168.1.1', 'OPERATIONNEL', '2022-01-15', 1),
('Routeur-Principal', 'Routeur Cisco', 'Salle Serveur', '192.168.1.254', 'OPERATIONNEL', '2021-06-10', 1),
('Serveur-Web-01', 'Serveur Dell PowerEdge', 'Salle Serveur', '192.168.1.10', 'OPERATIONNEL', '2021-03-20', 2),
('Serveur-DB-01', 'Serveur HP ProLiant', 'Salle Serveur', '192.168.1.11', 'MAINTENANCE', '2021-03-20', 2),
('PC-Bureau-Ahmed', 'Desktop HP', 'Bureau 204', '192.168.1.50', 'OPERATIONNEL', '2023-09-01', 3),
('Imprimante-RDC', 'Imprimante HP LaserJet', 'Couloir RDC', '192.168.1.80', 'EN_PANNE', '2020-11-05', 4);
