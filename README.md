# Development Platforms – Express API

This project is a simple backend API built with **Node.js**, **Express** and **TypeScript**.  
It uses **MySQL** as database and supports **user authentication with JWT**, **articles**, and **comments**.

This project was made for **Path A – Custom Express.js API**.

---

## Technologies used

- Node.js
- Express
- TypeScript
- MySQL (mysql2)
- JWT (jsonwebtoken)
- bcrypt

---

## Database (MySQL)

The project uses a **MySQL database** to store users, articles and comments.

### Tables used

#### users
- id (INT, primary key)
- e_post (VARCHAR, unique)
- password_hash (VARCHAR)
- opprettet_paa (DATETIME)

#### articles
- id (INT, primary key)
- tittel (VARCHAR)
- brodtekst (TEXT)
- kategori (VARCHAR)
- innsendt_av (INT, foreign key → users.id)
- opprettet_paa (DATETIME)

Each article belongs to one user.

#### comments
- id (INT, primary key)
- artikkel_id (INT, foreign key → articles.id)
- bruker_id (INT, foreign key → users.id)
- innhold (TEXT)
- opprettet_paa (DATETIME)

Each comment belongs to one article and one user.

---

## How to run the project

### 1. Install dependencies
```bash
npm install

## 2. Set up MySQL database
CREATE DATABASE dev_platforms_news;
USE dev_platforms_news;

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
