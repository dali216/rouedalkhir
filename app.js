// ==========================================
// ROUED AL KHAIR - SUPABASE APP
// ==========================================

const SUPABASE_URL =
  "https://iimzsfbkgugbqkipsdih.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_JFAxVtAkqUWJ1XSmhk7TZw_xPyT13dY";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ==========================================
// GET CURRENT PROFILE
// ==========================================

async function getProfile() {
  const {
    data: { user },
    error: userError
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Profile error:", error);
  }

  if (profile) {
    return {
      ...profile,
      email: user.email
    };
  }

  return {
    id: user.id,
    email: user.email,
    role: "volunteer"
  };
}


// ==========================================
// REQUIRE LOGIN
// ==========================================

async function requireAuth(target = "login.html") {
  const {
    data: { user }
  } = await supabaseClient.auth.getUser();

  if (!user) {
    window.location.href = target;
    return null;
  }

  return user;
}


// ==========================================
// REQUIRE ADMIN
// ==========================================

async function requireAdmin() {
  const profile = await getProfile();

  if (!profile || profile.role !== "admin") {
    window.location.href = "dashboard.html";
    return null;
  }

  return profile;
}


// ==========================================
// EMAIL CONFIRMATION REDIRECT
// ==========================================

// IMPORTANT:
// new URL() يخلي الرابط يخدم حتى كان الموقع داخل
// GitHub Pages repository مثل:
// username.github.io/roued-alkhair/

function getLoginRedirectUrl() {
  return new URL("login.html", window.location.href).href;
}


// ==========================================
// LOGIN
// ==========================================

const loginForm = document.getElementById("login");

if (loginForm) {

  loginForm.onsubmit = async function (e) {

    e.preventDefault();

    const msg = document.getElementById("msg");

    const email = document
      .getElementById("email")
      .value
      .trim();

    const password = document
      .getElementById("password")
      .value;

    msg.textContent = "Connexion...";

    const { data, error } =
      await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });

    if (error) {

      console.error(error);

      const errorMessage =
        error.message.toLowerCase();

      if (
        errorMessage.includes("email not confirmed") ||
        errorMessage.includes("email_not_confirmed")
      ) {

        msg.textContent =
          "⚠️ Vérifiez votre adresse email avant de vous connecter.";

      } else {

        msg.textContent =
          "Erreur : " + error.message;
      }

      return;
    }

    if (!data || !data.user) {

      msg.textContent =
        "Erreur : utilisateur introuvable.";

      return;
    }

    msg.textContent =
      "Connexion réussie !";

    setTimeout(async () => {

      const profile = await getProfile();

      if (
        profile &&
        profile.role === "admin"
      ) {

        window.location.href =
          "admin.html";

      } else {

        window.location.href =
          "dashboard.html";
      }

    }, 500);
  };
}


// ==========================================
// REGISTER
// ==========================================

const registerForm =
  document.getElementById("register");

if (registerForm) {

  registerForm.onsubmit = async function (e) {

    e.preventDefault();

    const msg =
      document.getElementById("msg");

    const name =
      document.getElementById("name")
        .value
        .trim();

    const email =
      document.getElementById("email")
        .value
        .trim()
        .toLowerCase();

    const password =
      document.getElementById("password")
        .value;

    if (!name) {
      msg.textContent =
        "Veuillez entrer votre nom.";

      return;
    }

    if (!email) {
      msg.textContent =
        "Veuillez entrer votre email.";

      return;
    }

    if (password.length < 6) {
      msg.textContent =
        "Le mot de passe doit contenir au moins 6 caractères.";

      return;
    }

    msg.textContent =
      "Création du compte...";


    // IMPORTANT:
    // URL relative pour éviter problème GitHub Pages
    const redirectUrl =
      getLoginRedirectUrl();


    const { data, error } =
      await supabaseClient.auth.signUp({

        email: email,

        password: password,

        options: {

          data: {
            full_name: name
          },

          emailRedirectTo:
            redirectUrl
        }
      });


    // Erreur Supabase
    if (error) {

      console.error(
        "SIGNUP ERROR:",
        error
      );

      msg.textContent =
        "Erreur : " + error.message;

      return;
    }


    // ======================================
    // USER CREATED
    // ======================================

    if (data && data.user) {

      // Avec Email Confirmation activé,
      // session تكون null وهذا طبيعي.

      if (!data.session) {

        msg.innerHTML =
          "✅ Compte créé avec succès !<br><br>" +
          "📧 Nous avons envoyé un email de confirmation à :<br>" +
          "<strong>" + email + "</strong><br><br>" +
          "Cliquez sur le lien dans l'email pour confirmer votre compte.<br>" +
          "Après confirmation, vous pourrez vous connecter.";

      } else {

        msg.innerHTML =
          "✅ Compte créé et connecté !";

      }


      // Désactiver le bouton
      const button =
        registerForm.querySelector("button");

      if (button) {
        button.disabled = true;
        button.textContent =
          "Email envoyé ✓";
      }
    }
  };
}


// ==========================================
// LOGOUT
// ==========================================

const logout =
  document.getElementById("logout");

if (logout) {

  logout.onclick = async function () {

    await supabaseClient.auth.signOut();

    window.location.href =
      "index.html";
  };
}


// ==========================================
// HANDLE EMAIL CONFIRMATION
// ==========================================

// Supabase peut retourner sur login.html
// après validation du lien email.

supabaseClient.auth.onAuthStateChange(
  async (event, session) => {

    console.log(
      "AUTH EVENT:",
      event
    );

    if (event === "SIGNED_IN" && session) {

      // On ne redirige pas automatiquement
      // depuis login pour laisser l'utilisateur
      // voir la confirmation.

      console.log(
        "Email confirmé / utilisateur connecté."
      );
    }
  }
);
