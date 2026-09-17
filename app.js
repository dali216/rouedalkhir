// ========================================
// ROUED AL KHAIR - SUPABASE CONFIG
// ========================================

const SUPABASE_URL =
  "https://iimzsfbkgugbqkipsdih.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_JFAxVtAkqUWJ1XSmhk7TZw_xPyT13dY";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ========================================
// GET CURRENT USER PROFILE
// ========================================

async function getProfile() {

  const {
    data: { user },
    error
  } = await supabaseClient.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: profile } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

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


// ========================================
// REQUIRE LOGIN
// ========================================

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


// ========================================
// REQUIRE ADMIN
// ========================================

async function requireAdmin() {

  const profile = await getProfile();

  if (!profile || profile.role !== "admin") {
    window.location.href = "dashboard.html";
    return null;
  }

  return profile;
}


// ========================================
// LOGIN
// ========================================

const loginForm = document.getElementById("login");

if (loginForm) {

  loginForm.onsubmit = async (e) => {

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

      if (
        error.message.toLowerCase().includes("email not confirmed")
      ) {
        msg.textContent =
          "⚠️ Vérifiez votre email avant de vous connecter.";
      } else {
        msg.textContent =
          "Erreur : " + error.message;
      }

      return;
    }

    if (!data.user) {
      msg.textContent =
        "Erreur : utilisateur introuvable.";
      return;
    }

    msg.textContent = "Connexion réussie !";

    // Petit délai pour laisser Supabase enregistrer la session
    setTimeout(async () => {

      const profile = await getProfile();

      if (profile && profile.role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "dashboard.html";
      }

    }, 300);
  };
}


// ========================================
// REGISTER
// ========================================

const registerForm = document.getElementById("register");

if (registerForm) {

  registerForm.onsubmit = async (e) => {

    e.preventDefault();

    const msg = document.getElementById("msg");

    const name = document
      .getElementById("name")
      .value
      .trim();

    const email = document
      .getElementById("email")
      .value
      .trim();

    const password = document
      .getElementById("password")
      .value;

    msg.textContent = "Création du compte...";

    const { data, error } =
      await supabaseClient.auth.signUp({

        email: email,

        password: password,

        options: {

          data: {
            full_name: name
          },

          // Après confirmation → retour login
          emailRedirectTo:
            window.location.origin + "/login.html"
        }
      });


    if (error) {

      msg.textContent =
        "Erreur : " + error.message;

      return;
    }


    // IMPORTANT :
    // On ne crée PLUS le profil ici.
    // Le trigger Supabase le crée automatiquement.

    if (data.user) {

      msg.innerHTML =
        "✅ Compte créé !<br>" +
        "📧 Vérifiez votre email puis cliquez sur le lien de confirmation.<br>" +
        "Après confirmation, revenez ici pour vous connecter.";

      // Désactive le bouton pour éviter plusieurs inscriptions
      const button =
        registerForm.querySelector("button");

      if (button) {
        button.disabled = true;
      }
    }

  };
}


// ========================================
// LOGOUT
// ========================================

const logout =
  document.getElementById("logout");

if (logout) {

  logout.onclick = async () => {

    await supabaseClient.auth.signOut();

    window.location.href = "index.html";
  };
}
