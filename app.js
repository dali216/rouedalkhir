const SUPABASE_URL = "https://iimzsfbkgugbqkipsdih.supabase.co";
const SUPABASE_KEY = "sb_publishable_JFAxVtAkqUWJ1XSmhk7TZw_xPyT13dY";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ===============================
// GET PROFILE
// ===============================
async function getProfile() {
  const {
    data: { user },
    error: userError
  } = await supabaseClient.auth.getUser();

  if (userError || !user) return null;

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Profile error:", error);
    return {
      id: user.id,
      email: user.email,
      role: "volunteer"
    };
  }

  return data
    ? { ...data, email: user.email }
    : {
        id: user.id,
        email: user.email,
        role: "volunteer"
      };
}

// ===============================
// REQUIRE AUTH
// ===============================
async function requireAuth(target = "login.html") {
  const {
    data: { user }
  } = await supabaseClient.auth.getUser();

  if (!user) {
    location.href = target;
    return null;
  }

  return user;
}

// ===============================
// REQUIRE ADMIN
// ===============================
async function requireAdmin() {
  const profile = await getProfile();

  if (!profile || profile.role !== "admin") {
    location.href = "dashboard.html";
    return null;
  }

  return profile;
}

// ===============================
// LOGIN
// ===============================
const loginForm = document.getElementById("login");

if (loginForm) {
  loginForm.onsubmit = async (e) => {
    e.preventDefault();

    const msg = document.getElementById("msg");

    msg.textContent = "Connexion...";

    const email = document
      .getElementById("email")
      .value
      .trim();

    const password = document
      .getElementById("password")
      .value;

    const { data, error } =
      await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      console.error("Login error:", error);
      msg.textContent = "Erreur : " + error.message;
      return;
    }

    const profile = await getProfile();

    if (profile?.role === "admin") {
      location.href = "admin.html";
    } else {
      location.href = "dashboard.html";
    }
  };
}

// ===============================
// REGISTER / SIGN UP
// ===============================
const registerForm = document.getElementById("register");

if (registerForm) {
  registerForm.onsubmit = async (e) => {
    e.preventDefault();

    const msg = document.getElementById("msg");

    msg.textContent = "Création du compte...";

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

    // Création du compte Supabase
    const { data, error } =
      await supabaseClient.auth.signUp({
        email,
        password
      });

    if (error) {
      console.error("Sign up error:", error);

      msg.textContent =
        "Erreur : " + error.message;

      return;
    }

    if (!data.user) {
      msg.textContent =
        "Erreur : impossible de créer le compte.";

      return;
    }

    // Si l'utilisateur possède déjà une session,
    // on crée directement son profil.
    if (data.session) {
      const { error: profileError } =
        await supabaseClient
          .from("profiles")
          .upsert({
            id: data.user.id,
            full_name: name,
            role: "volunteer"
          });

      if (profileError) {
        console.error(
          "Profile creation error:",
          profileError
        );

        msg.textContent =
          "Compte créé, mais le profil n'a pas pu être créé.";

        return;
      }

      msg.textContent =
        "Compte créé avec succès !";

      setTimeout(() => {
        location.href = "dashboard.html";
      }, 1500);

      return;
    }

    // Email confirmation activée
    msg.textContent =
      "Compte créé ! Vérifiez votre email pour confirmer votre compte.";
  };
}

// ===============================
// LOGOUT
// ===============================
const logout = document.getElementById("logout");

if (logout) {
  logout.onclick = async () => {
    await supabaseClient.auth.signOut();

    location.href = "index.html";
  };
}
