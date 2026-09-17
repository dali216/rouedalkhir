// ================================
// SUPABASE CONFIG
// ================================

const SUPABASE_URL =
  "https://iimzsfbkgugbqkipsdih.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_JFAxVtAkqUWJ1XSmhk7TZw_xPyT13dY";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ================================
// HELPERS
// ================================

async function getProfile() {
  const {
    data: { user },
    error: userError
  } = await supabaseClient.auth.getUser();

  if (userError || !user) return null;

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


async function requireAdmin() {
  const profile = await getProfile();

  if (!profile || profile.role !== "admin") {
    window.location.href = "dashboard.html";
    return null;
  }

  return profile;
}


// ================================
// EMAIL REDIRECT URL
// ================================

function getLoginRedirectUrl() {
  return new URL(
    "login.html",
    window.location.href
  ).href;
}


// ================================
// LOGIN
// ================================

const loginForm = document.getElementById("login");

if (loginForm) {

  loginForm.onsubmit = async function (e) {

    e.preventDefault();

    const msg = document.getElementById("msg");

    const email = document
      .getElementById("email")
      .value
      .trim()
      .toLowerCase();

    const password = document
      .getElementById("password")
      .value;

    msg.textContent = "Connexion...";

    const {
      data,
      error
    } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {

      const errorMessage =
        error.message.toLowerCase();

      if (
        errorMessage.includes("email not confirmed") ||
        errorMessage.includes("email_not_confirmed")
      ) {

        msg.innerHTML =
          "⚠️ Votre email n'est pas encore confirmé.<br>" +
          "Vérifiez votre boîte mail et cliquez sur le lien de confirmation.";

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

      const profile =
        await getProfile();

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


// ================================
// REGISTER
// ================================

const registerForm =
  document.getElementById("register");

if (registerForm) {

  registerForm.onsubmit = async function (e) {

    e.preventDefault();

    const msg =
      document.getElementById("msg");

    const name =
      document
        .getElementById("name")
        .value
        .trim();

    const email =
      document
        .getElementById("email")
        .value
        .trim()
        .toLowerCase();

    const password =
      document
        .getElementById("password")
        .value;


    // Validation

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


    // URL vers laquelle Supabase revient après confirmation

    const redirectUrl =
      getLoginRedirectUrl();


    // Création du compte

    const {
      data,
      error
    } = await supabaseClient.auth.signUp({

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


    // Erreur

    if (error) {

      console.error(
        "SIGNUP ERROR:",
        error
      );

      msg.textContent =
        "Erreur : " + error.message;

      return;
    }


    // Compte créé

    if (data && data.user) {

      // Email confirmation activée
      if (!data.session) {

        msg.innerHTML =
          "✅ <strong>Compte créé avec succès !</strong><br><br>" +

          "📧 Un email de confirmation a été envoyé à :<br>" +

          "<strong>" +
          email +
          "</strong><br><br>" +

          "Cliquez sur le lien reçu par email pour confirmer votre compte.<br><br>" +

          "⚠️ Si vous ne trouvez pas l'email, vérifiez le dossier Spam.";

        // Afficher bouton resend

        if (resendEmailBtn) {
          resendEmailBtn.style.display =
            "block";
        }

      } else {

        msg.innerHTML =
          "✅ Compte créé et connecté !";
      }


      // Désactiver bouton création

      const button =
        registerForm.querySelector(
          "button[type='submit']"
        );

      if (button) {

        button.disabled = true;

        button.textContent =
          "Email envoyé ✓";
      }
    }
  };
}


// ================================
// RESEND CONFIRMATION EMAIL
// ================================

const resendEmailBtn =
  document.getElementById(
    "resendEmail"
  );

if (resendEmailBtn) {

  resendEmailBtn.onclick =
    async function () {

      const msg =
        document.getElementById("msg");

      const email =
        document
          .getElementById("email")
          .value
          .trim()
          .toLowerCase();


      if (!email) {

        msg.textContent =
          "Écrivez votre email d'abord.";

        return;
      }


      resendEmailBtn.disabled =
        true;

      resendEmailBtn.textContent =
        "Envoi en cours...";

      msg.textContent =
        "Réenvoi de l'email de confirmation...";


      const redirectUrl =
        getLoginRedirectUrl();


      const {
        error
      } = await supabaseClient.auth.resend({

        type: "signup",

        email: email,

        options: {

          emailRedirectTo:
            redirectUrl
        }

      });


      if (error) {

        console.error(
          "RESEND ERROR:",
          error
        );

        msg.textContent =
          "❌ " + error.message;

        resendEmailBtn.disabled =
          false;

        resendEmailBtn.textContent =
          "إعادة إرسال رابط التأكيد";

        return;
      }


      msg.innerHTML =
        "✅ <strong>تم إرسال رابط تأكيد جديد.</strong><br><br>" +
        "تفقد بريدك الإلكتروني و Spam.";


      resendEmailBtn.textContent =
        "تم الإرسال ✓";


      // حماية من الضغط المتكرر

      setTimeout(() => {

        resendEmailBtn.disabled =
          false;

        resendEmailBtn.textContent =
          "إعادة إرسال رابط التأكيد";

      }, 60000);
    };
}


// ================================
// LOGOUT
// ================================

const logout =
  document.getElementById("logout");

if (logout) {

  logout.onclick = async function () {

    await supabaseClient.auth.signOut();

    window.location.href =
      "index.html";
  };
}


// ================================
// AUTH STATE
// ================================

supabaseClient.auth.onAuthStateChange(
  async (event, session) => {

    console.log(
      "AUTH EVENT:",
      event
    );

    if (
      event === "SIGNED_IN" &&
      session
    ) {

      console.log(
        "Utilisateur connecté / email confirmé."
      );
    }
  }
);
