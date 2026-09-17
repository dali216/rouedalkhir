# Roued Al Khair — Version 2

Fonctions ajoutées :
- création de compte bénévole
- connexion Supabase
- redirection automatique admin → admin.html
- dashboard bénévole protégé
- dashboard admin protégé par rôle
- ajout/suppression d'événements
- gestion du rôle `volunteer` / `admin`
- changement de logo par URL (localStorage pour le moment)
- SQL Supabase avec Row Level Security

## Installation
1. Garde `app.js`, `style.css`, `index.html`, `login.html`, `register.html`, `dashboard.html`, `admin.html`.
2. Dans Supabase → SQL Editor, exécute `supabase.sql`.
3. Crée un compte depuis `register.html`.
4. Dans Supabase, attribue le rôle `admin` à ton premier compte avec la requête commentée dans `supabase.sql`.
5. Recharge le site et connecte-toi : le compte admin sera envoyé vers `admin.html`.

## Logo
La partie URL du logo est prête, mais pour un vrai logo permanent pour tous les visiteurs, le mieux est d'utiliser Supabase Storage ou un champ `settings` en base. La version actuelle garde l'URL dans le navigateur admin.
