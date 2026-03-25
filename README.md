# Euro School — projet de formation

Application web simple pour gérer des **cours** et des **utilisateurs** (admin, professeur, élève).  
Stack : **Laravel** (API + Sanctum) et **React** (Vite).

## Prérequis

- PHP 8.2+ avec extensions courantes (pdo, mbstring, openssl, …)
- Composer
- Node.js 18+ et npm

## Installation

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
npm install
```

## Lancer en local

Deux terminaux :

```bash
php artisan serve
```

```bash
npm run dev
```

Ouvrir l’URL affichée par Vite (souvent `http://127.0.0.1:5173`) en pointant vers le front qui consomme l’API Laravel.

Compte admin après seed : `admin@euroschool.com` / `password`.

## Fonctions principales

- Connexion / inscription (élève ou professeur)
- Admin : statistiques simples, utilisateurs, élèves, professeurs, cours, inscriptions sur les cours
- Élève : catalogue des cours et inscription
- Professeur : liste des cours liés

## Tests PHP

```bash
php artisan test
```
