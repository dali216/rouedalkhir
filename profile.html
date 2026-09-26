<!DOCTYPE html>

<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Profil - Roued Al Khair</title>

  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

  <script src="app.js"></script>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      font-family: Arial, sans-serif;
      background: #f5f5f5;
      color: #111;
    }

    .container {
      width: 100%;
      max-width: 600px;
      margin: auto;
      padding: 25px 15px 50px;
    }

    .top {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 25px;
    }

    .back {
      width: 42px;
      height: 42px;
      border: 0;
      border-radius: 12px;
      background: #111;
      color: white;
      font-size: 22px;
      cursor: pointer;
    }

    .top h1 {
      margin: 0;
      font-size: 23px;
    }

    .card {
      background: white;
      border-radius: 22px;
      padding: 35px 22px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.08);
      text-align: center;
    }

    .avatar {
      width: 140px;
      height: 140px;
      margin: 0 auto 20px;
      border-radius: 50%;
      background: #111;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 55px;
      font-weight: bold;
      overflow: hidden;
      border: 5px solid #eee;
    }

    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .name {
      font-size: 25px;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .role {
      display: inline-block;
      padding: 9px 16px;
      border-radius: 20px;
      background: #f1f1f1;
      font-size: 13px;
      font-weight: bold;
      color: #555;
    }

    .organisation {
      margin-top: 25px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 14px;
      color: #777;
    }

    .loading {
      text-align: center;
      padding: 60px 10px;
      color: #777;
    }

    .error {
      background: white;
      border-radius: 20px;
      padding: 35px 20px;
      text-align: center;
      color: #a40000;
      box-shadow: 0 8px 30px rgba(0,0,0,0.08);
    }

    @media (max-width: 500px) {
      .container {
        padding: 18px 12px 40px;
      }

      .avatar {
        width: 120px;
        height: 120px;
        font-size: 45px;
      }

      .name {
        font-size: 22px;
      }
    }
  </style>

</head>

<body>

  <div class="container">

```
<div class="top">
  <button class="back" onclick="history.back()">‹</button>
  <h1>Profil du membre</h1>
</div>

<div id="loading" class="loading">
  ⏳ Chargement du profil...
</div>

<div id="profileCard" class="card" style="display:none;">

  <div id="avatar" class="avatar">
    👤
  </div>

  <div id="fullName" class="name">
    —
  </div>

  <div id="role" class="role">
    Membre
  </div>

  <div class="organisation">
    <strong>Roued Al Khair</strong><br>
    Profil officiel du membre
  </div>

</div>

<div id="errorBox" class="error" style="display:none;">
  ❌ Profil introuvable.
</div>
```

  </div>

<script>

  function getInitial(name) {
    if (!name) return "👤";

    return name
      .trim()
      .charAt(0)
      .toUpperCase();
  }

  function formatRole(role) {

    if (!role) return "Membre";

    const roles = {
      admin: "Administrateur",
      president: "Président",
      vice_president: "Vice-président",
      responsable: "Responsable",
      member: "Membre",
      volunteer: "Bénévole"
    };

    return roles[role] || role;
  }

  async function loadPublicProfile() {

    try {

      if (!window.supabaseClient) {
        throw new Error("Supabase n'est pas disponible.");
      }

      // Récupérer l'ID depuis le QR
      const params = new URLSearchParams(
        window.location.search
      );

      const userId = params.get("id");

      if (!userId) {
        throw new Error("ID du profil manquant.");
      }

      // Chercher le profil correspondant
      const {
        data,
        error
      } = await window.supabaseClient
        .from("profiles")
        .select("id,full_name,role,avatar_url")
        .eq("id", userId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Profil introuvable.");
      }

      // Nom
      document.getElementById(
        "fullName"
      ).textContent = data.full_name || "Membre";

      // Rôle
      document.getElementById(
        "role"
      ).textContent = formatRole(data.role);

      // Photo
      const avatar =
        document.getElementById("avatar");

      if (data.avatar_url) {

        avatar.innerHTML = `
          <img
            src="${data.avatar_url}"
            alt="Photo de ${data.full_name || "membre"}"
          >
        `;

      } else {

        avatar.textContent =
          getInitial(data.full_name);

      }

      document.getElementById(
        "loading"
      ).style.display = "none";

      document.getElementById(
        "profileCard"
      ).style.display = "block";

    } catch (error) {

      console.error(
        "PUBLIC PROFILE ERROR:",
        error
      );

      document.getElementById(
        "loading"
      ).style.display = "none";

      document.getElementById(
        "errorBox"
      ).style.display = "block";

    }
  }

  document.addEventListener(
    "DOMContentLoaded",
    loadPublicProfile
  );

</script>

</body>
</html>
