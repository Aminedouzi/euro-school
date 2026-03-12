-- ============================================================
--  EuroSchool System (ESS) — Création des Tables
-- ============================================================

CREATE DATABASE IF NOT EXISTS euroschool_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE euroschool_db;

-- ============================================================
-- 1. FORMATION
-- ============================================================
CREATE TABLE formation (
    id_formation      INT           NOT NULL AUTO_INCREMENT,
    libelle_formation VARCHAR(100)  NOT NULL,
    description       TEXT,
    duree_mois        INT           NOT NULL,
    tarif_mensuel     DECIMAL(10,2) NOT NULL,

    PRIMARY KEY (id_formation)
);

-- ============================================================
-- 2. PERSONNEL
-- ============================================================
CREATE TABLE personnel (
    id_personnel      INT          NOT NULL AUTO_INCREMENT,
    nom               VARCHAR(50)  NOT NULL,
    prenom            VARCHAR(50)  NOT NULL,
    role              ENUM('admin','secretaire','professeur') NOT NULL,
    email             VARCHAR(100) NOT NULL,
    telephone         VARCHAR(20),
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    date_embauche     DATE,

    PRIMARY KEY (id_personnel),
    UNIQUE (email)
);

-- ============================================================
-- 3. GROUPE
-- ============================================================
CREATE TABLE groupe (
    id_groupe    INT          NOT NULL AUTO_INCREMENT,
    libelle      VARCHAR(100) NOT NULL,
    horaire      VARCHAR(50),
    capacite_max INT          NOT NULL DEFAULT 20,
    id_formation INT          NOT NULL,
    id_personnel INT,

    PRIMARY KEY (id_groupe),
    FOREIGN KEY (id_formation) REFERENCES formation(id_formation),
    FOREIGN KEY (id_personnel) REFERENCES personnel(id_personnel)
);

-- ============================================================
-- 4. ELEVE
-- ============================================================
CREATE TABLE eleve (
    id_eleve          INT          NOT NULL AUTO_INCREMENT,
    nom               VARCHAR(50)  NOT NULL,
    prenom            VARCHAR(50)  NOT NULL,
    date_naissance    DATE,
    telephone         VARCHAR(20),
    email             VARCHAR(100),
    adresse           TEXT,
    date_inscription  DATE         NOT NULL,
    mot_de_passe_hash VARCHAR(255) NOT NULL,

    PRIMARY KEY (id_eleve),
    UNIQUE (email)
);

-- ============================================================
-- 5. INSCRIPTION  (relation N-N entre ELEVE et GROUPE)
-- ============================================================
CREATE TABLE inscription (
    id_inscription   INT  NOT NULL AUTO_INCREMENT,
    id_eleve         INT  NOT NULL,
    id_groupe        INT  NOT NULL,
    date_inscription DATE NOT NULL,
    statut           ENUM('actif','termine','annule') NOT NULL DEFAULT 'actif',

    PRIMARY KEY (id_inscription),
    UNIQUE (id_eleve, id_groupe),
    FOREIGN KEY (id_eleve)  REFERENCES eleve(id_eleve),
    FOREIGN KEY (id_groupe) REFERENCES groupe(id_groupe)
);

-- ============================================================
-- 6. ABONNEMENT
-- ============================================================
CREATE TABLE abonnement (
    id_abonnement   INT           NOT NULL AUTO_INCREMENT,
    id_eleve        INT           NOT NULL,
    id_groupe       INT           NOT NULL,
    date_debut      DATE          NOT NULL,
    date_fin        DATE          NOT NULL,
    statut          ENUM('actif','expire','suspendu') NOT NULL DEFAULT 'actif',
    montant_mensuel DECIMAL(10,2) NOT NULL,

    PRIMARY KEY (id_abonnement),
    FOREIGN KEY (id_eleve)  REFERENCES eleve(id_eleve),
    FOREIGN KEY (id_groupe) REFERENCES groupe(id_groupe)
);

-- ============================================================
-- 7. PAIEMENT
-- ============================================================
CREATE TABLE paiement (
    id_paiement   INT           NOT NULL AUTO_INCREMENT,
    id_abonnement INT           NOT NULL,
    id_personnel  INT           NOT NULL,
    montant_paye  DECIMAL(10,2) NOT NULL,
    date_paiement DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    mode_paiement ENUM('cash')  NOT NULL DEFAULT 'cash',
    reference     VARCHAR(50)   NOT NULL,

    PRIMARY KEY (id_paiement),
    UNIQUE (reference),
    FOREIGN KEY (id_abonnement) REFERENCES abonnement(id_abonnement),
    FOREIGN KEY (id_personnel)  REFERENCES personnel(id_personnel)
);

-- ============================================================
-- 8. FACTURE
-- ============================================================
CREATE TABLE facture (
    id_facture      INT           NOT NULL AUTO_INCREMENT,
    id_paiement     INT           NOT NULL,
    numero_facture  VARCHAR(30)   NOT NULL,
    date_emission   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    montant_facture DECIMAL(10,2) NOT NULL,
    chemin_pdf      VARCHAR(255),

    PRIMARY KEY (id_facture),
    UNIQUE (id_paiement),
    UNIQUE (numero_facture),
    FOREIGN KEY (id_paiement) REFERENCES paiement(id_paiement)
);