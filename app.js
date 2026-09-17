```javascript
// ========================================
// SUPABASE
// ========================================

const SUPABASE_URL =
  "https://iimzsfbkgugbqkipsdih.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_JFAxVtAkqUWJ1XSmhk7TZw_xPyT13dY";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage
      }
    }
  );


// ========================================
// VAPID PUBLIC KEY
// ========================================

const VAPID_PUBLIC_KEY =
  "BPhQnLNpn525kJsVWEiwbyQGnX5G7wmIBQRUnO4yFoJjaumolPGW37VNVRzlJmFMDdr4rO6_P6ht4MEsBVS6oA4";


// ========================================
// REDIRECT URL
// ========================================

function getRedirectUrl() {

  return new URL(
    "login.html",
    window.location.href
  ).href;

}


// ========================================
// QR CODE USER
// ========================================

function generateUserQR(
  userId,
  elementId
) {

  const element =
    document.getElementById(
      elementId
    );

  if (
    !element ||
    !userId
  ) {
    return;
  }

  const profileUrl =
    new URL(
      "profile.html?id=" +
      encodeURIComponent(userId),
      window.location.href
    ).href;

  element.innerHTML = "";

  new QRCode(element, {

    text: profileUrl,

    width: 180,

    height: 180,

    correctLevel:
      QRCode.CorrectLevel.H

  });

}


// ========================================
// GET PROFILE
// ========================================

async function getProfile() {

  const {
    data: {
      user
    }
  } =
    await supabaseClient.auth
      .getUser();

  if (!user) {
    return null;
  }

  const {
    data: profile
  } =
    await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

  if (profile) {

    return {

      ...profile,

      email:
        user.email

    };

  }

  return {

    id:
      user.id,

    email:
      user.email,

    role:
      "volunteer"

  };

}


// ========================================
// AUTH PROTECTION
// ========================================

async function requireAuth(
  target = "login.html"
) {

  const {
    data: {
      user
    }
  } =
    await supabaseClient.auth
      .getUser();

  if (!user) {

    window.location.href =
      target;

    return null;

  }

  return user;

}


// ========================================
// ADMIN
// ========================================

async function requireAdmin() {

  const profile =
    await getProfile();

  if (
    !profile ||
    profile.role !== "admin"
  ) {

    window.location.href =
      "dashboard.html";

    return null;

  }

  return profile;

}


// ========================================
// REGISTER
// ========================================

const registerForm =
  document.getElementById(
    "register"
  );

if (registerForm) {

  registerForm.addEventListener(
    "submit",
    async function (e) {

      e.preventDefault();

      const msg =
        document.getElementById(
          "msg"
        );

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


      if (!name) {

        msg.textContent =
          "❌ Entrez votre nom.";

        return;

      }


      if (!email) {

        msg.textContent =
          "❌ Entrez votre email.";

        return;

      }


      if (password.length < 6) {

        msg.textContent =
          "❌ Minimum 6 caractères.";

        return;

      }


      msg.innerHTML =
        "⏳ Création du compte...";


      try {

        const redirectUrl =
          getRedirectUrl();


        const {
          data,
          error
        } =
          await supabaseClient.auth
            .signUp({

              email:
                email,

              password:
                password,

              options: {

                data: {

                  full_name:
                    name

                },

                emailRedirectTo:
                  redirectUrl

              }

            });


        if (error) {

          console.error(
            "SIGNUP ERROR:",
            error
          );

          msg.innerHTML =
            "❌ " +
            error.message;

          return;

        }


        if (data.user) {

          if (!data.session) {

            msg.innerHTML =
              "✅ <strong>Compte créé !</strong><br><br>" +
              "📧 Vérifiez votre email :<br>" +
              "<strong>" +
              email +
              "</strong><br><br>" +
              "Cliquez sur le lien de confirmation.<br><br>" +
              "📁 Vérifiez aussi Spam.";


            const resend =
              document.getElementById(
                "resendEmail"
              );


            if (resend) {

              resend.style.display =
                "block";

            }

          } else {

            msg.innerHTML =
              "✅ Compte créé !";


            setTimeout(() => {

              window.location.href =
                "dashboard.html";

            }, 1000);

          }

        }


      } catch (error) {

        console.error(error);

        msg.innerHTML =
          "❌ Erreur : " +
          error.message;

      }

    }
  );

}


// ========================================
// RESEND CONFIRMATION
// ========================================

const resendEmail =
  document.getElementById(
    "resendEmail"
  );


if (resendEmail) {

  resendEmail.addEventListener(
    "click",
    async function () {

      const msg =
        document.getElementById(
          "msg"
        );


      const email =
        document
          .getElementById("email")
          .value
          .trim()
          .toLowerCase();


      if (!email) {

        msg.innerHTML =
          "❌ Entrez votre email.";

        return;

      }


      resendEmail.disabled =
        true;


      resendEmail.textContent =
        "⏳ Envoi...";


      try {

        const redirectUrl =
          getRedirectUrl();


        const {
          error
        } =
          await supabaseClient.auth
            .resend({

              type:
                "signup",

              email:
                email,

              options: {

                emailRedirectTo:
                  redirectUrl

              }

            });


        if (error) {

          msg.innerHTML =
            "❌ " +
            error.message;


          resendEmail.disabled =
            false;


          resendEmail.textContent =
            "إعادة إرسال رابط التأكيد";

          return;

        }


        msg.innerHTML =
          "✅ رابط تأكيد جديد تم إرساله.<br>" +
          "تفقد Email و Spam.";


        resendEmail.textContent =
          "تم الإرسال ✓";


        setTimeout(() => {

          resendEmail.disabled =
            false;

          resendEmail.textContent =
            "إعادة إرسال رابط التأكيد";

        }, 60000);


      } catch (error) {

        msg.innerHTML =
          "❌ " +
          error.message;


        resendEmail.disabled =
          false;


        resendEmail.textContent =
          "إعادة إرسال رابط التأكيد";

      }

    }
  );

}


// ========================================
// LOGIN
// ========================================

const loginForm =
  document.getElementById(
    "login"
  );


if (loginForm) {

  loginForm.addEventListener(
    "submit",
    async function (e) {

      e.preventDefault();


      const msg =
        document.getElementById(
          "msg"
        );


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


      msg.innerHTML =
        "⏳ Connexion...";


      try {

        const {
          data,
          error
        } =
          await supabaseClient.auth
            .signInWithPassword({

              email:
                email,

              password:
                password

            });


        if (error) {

          if (
            error.message
              .toLowerCase()
              .includes(
                "email not confirmed"
              )
          ) {

            msg.innerHTML =
              "⚠️ Confirmez votre email avant de vous connecter.";

          } else {

            msg.innerHTML =
              "❌ " +
              error.message;

          }

          return;

        }


        if (data.user) {

          const profile =
            await get
```
