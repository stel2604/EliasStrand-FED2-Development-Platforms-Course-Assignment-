CREATE DATABASE development_platforms_ca;
USE development_platforms_ca;

CREATE TABLE brukere (
  id INT AUTO_INCREMENT PRIMARY KEY,
  e_post VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  opprettet_paa TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE artikler (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tittel VARCHAR(200) NOT NULL,
  brodtekst TEXT NOT NULL,
  kategori VARCHAR(80) NOT NULL,
  innsendt_av INT NOT NULL,
  opprettet_paa TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (innsendt_av) REFERENCES brukere(id)
);

CREATE TABLE kommentarer (
  id INT AUTO_INCREMENT PRIMARY KEY,
  artikkel_id INT NOT NULL,
  bruker_id INT NOT NULL,
  innhold TEXT NOT NULL,
  opprettet_paa TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (artikkel_id) REFERENCES artikler(id) ON DELETE CASCADE,
  FOREIGN KEY (bruker_id) REFERENCES brukere(id) ON DELETE CASCADE
);
