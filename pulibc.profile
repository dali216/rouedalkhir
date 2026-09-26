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

    .edit-btn,
    .save-btn,
    .cancel-btn {
      width: 100%;
      height: 50px;
      border: 0;
      border-radius: 13px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
    }

    .edit-btn {
      margin-top: 25px;
      background: #111;
      color: white;
    }

    .save-btn {
      margin-top: 20px;
      background: #111;
      color: white;
    }

    .cancel-btn {
      margin-top: 10px;
      background: #eee;
      color: #111;
    }

    .edit-section {
      display: none;
      margin-top: 25px;
      padding-top: 25px;
      border-top: 1px solid #eee;
      text-align: left;
    }

    .edit-section label {
      display: block;
      margin-bottom: 8px;
      font-size: 13px;
      font-weight: bold;
    }

    .edit-section input[type="text"] {
      width: 100%;
      height: 48px;
      border: 1px solid #ddd;
      border-radius: 12px;
      padding: 0 14px;
      font-size: 15px;
      outline: none;
    }

    .edit-section input[type="text"]:focus {
      border-color: #111;
    }

    .photo-label {
      display: block;
      width: 100%;
      padding: 14px;
      margin-top: 8px;
      border-radius: 12px;
      background: #f1f1f1;
      text-align: center;
      font-size: 13px;
      font-weight: bold;
      cursor: pointer;
    }

    #photoInput {
      display: none;
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

    .message {
      display: none;
      margin-top: 15px;
      padding: 12px;
      border-radius: 10px;
      text-align: center;
      font-size: 13px;
    }

    .message.success {
      display: block;
      background: #e9f8ed;
      color: #18733a;
    }

    .message.error {
      display: block;
      background: #ffeaea;
      color: #a40000;
    }
  </style>

</head>

<body>

<div class="container">

  <div class="top">
    <button class="back" onclick="history.back()">‹</button>
    <h1>Profil du membre</h1>
  </div>

  <div id="loading" class="loading">
    ⏳ Chargement du profil...
  </div>

  <div id="profileCard" class="card" style="display:none;">

```
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

<!-- يظهر فقط لصاحب الحساب -->
<button
  id="editBtn"
  class="edit-btn"
  style="display:none;"
  onclick="openEdit()"
>
  ✏️ Modifier le profil
</button>

<!-- EDIT -->
<div id="editSection" class="edit-section">

  <label for="nameInput">
    Nom complet
  </label>

  <input
    type="text"
    id="nameInput"
    maxlength="100"
    placeholder="Votre nom complet"
  >

  <label style="margin-top:18px;">
    Photo de profil
  </label>

  <label
    for="photoInput"
    class="photo-label"
  >
    📷 Choisir une nouvelle photo
  </label>

  <input
    type="file"
    id="photoInput"
    accept="image/jpeg,image/png,image/webp"
  >

  <button
    id="saveBtn"
    class="save-btn"
    onclick="saveProfile()"
  >
    💾 Enregistrer
  </button>

  <button
    class="cancel-btn"
    onclick="closeEdit()"
  >
    Annuler
  </button>

  <div id="message" class="message"></div>

</div>
```

  </div>

  <div id="errorBox" class="error" style="display:none;">
    ❌ Profil introuvable.
  </div>

</div>

<script>

let profileId = null;
let currentProfile = null;
let currentUser = null;
let selectedPhoto = null;


// ==========================
// INITIAL
// ==========================

async function loadPublicProfile() {

  try {

    if (!window.supabaseClient) {
      throw new Error("Supabase n'est pas disponible.");
    }

    const params =
      new URLSearchParams(window.location.search);

    profileId = params.get("id");

    if (!profileId) {
      throw new Error("ID du profil manquant.");
    }

    // Utilisateur connecté
    const {
      data: { user }
    } = await window.supabaseClient.auth.getUser();

    currentUser = user || null;


    // Charger le profil demandé
    const {
      data,
      error
    } = await window.supabaseClient
      .from("profiles")
      .select("id,full_name,role,avatar_url")
      .eq("id", profileId)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error("Profil introuvable.");
    }

    currentProfile = data;


    // Affichage
    document.getElementById("fullName").textContent =
      data.full_name || "Membre";

    document.getElementById("role").textContent =
      formatRole(data.role);

    displayAvatar(
      data.full_name,
      data.avatar_url
    );


    // ==========================
    // AUTORISER EDIT UNIQUEMENT
    // AU PROPRIETAIRE
    // ==========================

    if (
      currentUser &&
      currentUser.id === profileId
    ) {

      document.getElementById(
        "editBtn"
      ).style.display = "block";

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


// ==========================
// ROLE
// ==========================

function formatRole(role) {

  const roles = {
    admin: "Administrateur",
    president: "Président",
    vice_president: "Vice-président",
    responsable: "Responsable",
    member: "Membre",
    volunteer: "Bénévole"
  };

  return roles[role] || role || "Membre";
}


// ==========================
// AVATAR
// ==========================

function displayAvatar(name, url) {

  const avatar =
    document.getElementById("avatar");

  if (url) {

    avatar.innerHTML = `
      <img
        src="${url}"
        alt="Photo de profil"
      >
    `;

  } else {

    avatar.textContent =
      name
        ? name.trim().charAt(0).toUpperCase()
        : "👤";
  }
}


// ==========================
// OPEN EDIT
// ==========================

function openEdit() {

  document.getElementById(
    "editSection"
  ).style.display = "block";

  document.getElementById(
    "editBtn"
  ).style.display = "none";

  document.getElementById(
    "nameInput"
  ).value =
    currentProfile.full_name || "";
}


// ==========================
// CLOSE EDIT
// ==========================

function closeEdit() {

  document.getElementById(
    "editSection"
  ).style.display = "none";

  document.getElementById(
    "editBtn"
  ).style.display = "block";

  selectedPhoto = null;

  document.getElementById(
    "photoInput"
  ).value = "";

  document.getElementById(
    "message"
  ).className = "message";
}


// ==========================
// PHOTO SELECT
// ==========================

document
  .getElementById("photoInput")
  .addEventListener("change", function(e) {

    const file = e.target.files[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {

      showMessage(
        "❌ La photo doit faire moins de 5 MB.",
        "error"
      );

      e.target.value = "";
      return;
    }

    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowed.includes(file.type)) {

      showMessage(
        "❌ Format non accepté.",
        "error"
      );

      e.target.value = "";
      return;
    }

    selectedPhoto = file;

  });


// ==========================
// UPLOAD PHOTO
// ==========================

async function uploadPhoto() {

  if (!selectedPhoto) {
    return currentProfile.avatar_url || "";
  }

  const extension =
    selectedPhoto.name
      .split(".")
      .pop()
      .toLowerCase();

  const filePath =
    currentUser.id +
    "/avatar." +
    extension;

  const {
    error
  } = await window.supabaseClient
    .storage
    .from("avatars")
    .upload(
      filePath,
      selectedPhoto,
      {
        upsert: true,
        contentType: selectedPhoto.type
      }
    );

  if (error) {
    throw error;
  }

  const {
    data
  } = window.supabaseClient
    .storage
    .from("avatars")
    .getPublicUrl(filePath);

  return data.publicUrl +
    "?t=" +
    Date.now();
}


// ==========================
// SAVE PROFILE
// ==========================

async function saveProfile() {

  const name =
    document
      .getElementById("nameInput")
      .value
      .trim();

  if (!name) {

    showMessage(
      "❌ Entrez votre nom.",
      "error"
    );

    return;
  }

  if (!currentUser ||
      currentUser.id !== profileId) {

    showMessage(
      "❌ Vous n'êtes pas autorisé à modifier ce profil.",
      "error"
    );

    return;
  }

  const saveBtn =
    document.getElementById("saveBtn");

  try {

    saveBtn.disabled = true;
    saveBtn.textContent =
      "⏳ Enregistrement...";


    // Photo
    const avatarUrl =
      await uploadPhoto();


    // Mise à jour Supabase
    const {
      error
    } = await window.supabaseClient
      .from("profiles")
      .update({
        full_name: name,
        avatar_url: avatarUrl
      })
      .eq("id", currentUser.id);

    if (error) {
      throw error;
    }


    // Actualiser localement
    currentProfile.full_name = name;
    currentProfile.avatar_url = avatarUrl;


    document.getElementById(
      "fullName"
    ).textContent = name;

    displayAvatar(
      name,
      avatarUrl
    );


    selectedPhoto = null;

    document.getElementById(
      "photoInput"
    ).value = "";


    showMessage(
      "✅ Profil mis à jour avec succès.",
      "success"
    );


    setTimeout(() => {
      closeEdit();
    }, 1200);

  } catch (error) {

    console.error(
      "SAVE PROFILE ERROR:",
      error
    );

    showMessage(
      "❌ Erreur : " + error.message,
      "error"
    );

  } finally {

    saveBtn.disabled = false;
    saveBtn.textContent =
      "💾 Enregistrer";
  }
}


// ==========================
// MESSAGE
// ==========================

function showMessage(text, type) {

  const box =
    document.getElementById("message");

  box.textContent = text;
  box.className =
    "message " + type;
}


// ==========================
// START
// ==========================

document.addEventListener(
  "DOMContentLoaded",
  loadPublicProfile
);

</script>

</body>
</html>
