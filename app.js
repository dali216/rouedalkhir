// ========================================
// SUPABASE
// ========================================

const SUPABASE_URL =
  "https://iimzsfbkgugbqkipsdih.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_JFAxVtAkqUWJ1XSmhk7TZw_xPyT13dY";

window.supabaseClient =
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
// BASE64 → UINT8ARRAY
// ========================================

function urlBase64ToUint8Array(base64String) {

  const padding =
    "=".repeat(
      (4 - base64String.length % 4) % 4
    );

  const base64 =
    (
      base64String +
      padding
    )
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const rawData =
    window.atob(base64);

  const outputArray =
    new Uint8Array(
      rawData.length
    );

  for (
    let i = 0;
    i < rawData.length;
    ++i
  ) {

    outputArray[i] =
      rawData.charCodeAt(i);

  }

  return outputArray;

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
    await window.supabaseClient.auth.getUser();

  if (!user) {
    return null;
  }

  const {
    data: profile,
    error
  } =
    await window.supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

  if (error) {

    console.error(
      "PROFILE ERROR:",
      error
    );

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
    await window.supabaseClient.auth.getUser();

  if (!user) {

    window.location.href =
      target;

    return null;

  }

  return user;

}


// ========================================
// ADMIN PROTECTION
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

  if (
    typeof QRCode === "undefined"
  ) {

    console.error(
      "QRCode library not loaded."
    );

    return;

  }

  new QRCode(
    element,
    {
      text: profileUrl,
      width: 180,
      height: 180,
      correctLevel:
        QRCode.CorrectLevel.H
    }
  );

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
          await window.supabaseClient.auth
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

            setTimeout(
              () => {

                window.location.href =
                  "dashboard.html";

              },
              1000
            );

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
// RESEND CONFIRMATION EMAIL
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

      const emailInput =
        document.getElementById(
          "email"
        );

      const email =
        emailInput
          ? emailInput.value
              .trim()
              .toLowerCase()
          : "";

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
          await window.supabaseClient.auth
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


        setTimeout(
          () => {

            resendEmail.disabled =
              false;

            resendEmail.textContent =
              "إعادة إرسال رابط التأكيد";

          },
          60000
        );

      } catch (error) {

        console.error(error);

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
          await window.supabaseClient.auth
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

        }

      } catch (error) {

        console.error(error);

        msg.innerHTML =
          "❌ " +
          error.message;

      }

    }
  );

}


// ========================================
// LOGOUT
// ========================================

const logout =
  document.getElementById(
    "logout"
  );

if (logout) {

  logout.addEventListener(
    "click",
    async function () {

      try {

        await window.supabaseClient.auth
          .signOut();

      } catch (error) {

        console.error(
          "LOGOUT ERROR:",
          error
        );

      }

      window.location.href =
        "index.html";

    }
  );

}


// ========================================
// SERVICE WORKER
// ========================================

async function registerServiceWorker() {

  if (
    !("serviceWorker" in navigator)
  ) {

    console.warn(
      "Service Worker non supporté."
    );

    return null;

  }

  try {

    const registration =
      await navigator.serviceWorker.register(
        "./sw.js",
        {
          scope: "./"
        }
      );

    console.log(
      "✅ Service Worker actif:",
      registration.scope
    );

    return registration;

  } catch (error) {

    console.error(
      "❌ Service Worker error:",
      error
    );

    return null;

  }

}


// ========================================
// PUSH NOTIFICATIONS
// ========================================

async function enablePushNotifications() {

  const button =
    document.getElementById(
      "enablePush"
    );

  const status =
    document.getElementById(
      "pushStatus"
    );


  if (!button || !status) {

    console.warn(
      "Bouton enablePush ou pushStatus introuvable."
    );

    return;

  }


  if (
    !("Notification" in window)
  ) {

    status.textContent =
      "❌ Votre navigateur ne supporte pas les notifications.";

    return;

  }


  if (
    !("serviceWorker" in navigator)
  ) {

    status.textContent =
      "❌ Service Worker non supporté.";

    return;

  }


  if (
    !("PushManager" in window)
  ) {

    status.textContent =
      "❌ Les notifications Push ne sont pas supportées.";

    return;

  }


  button.disabled =
    true;

  button.textContent =
    "⏳ Activation...";


  try {

    const {
      data: {
        user
      }
    } =
      await window.supabaseClient.auth.getUser();


    if (!user) {

      throw new Error(
        "Vous devez être connecté."
      );

    }


    const registration =
      await registerServiceWorker();


    if (!registration) {

      throw new Error(
        "Impossible d'activer le Service Worker."
      );

    }


    const permission =
      await Notification.requestPermission();


    if (
      permission !== "granted"
    ) {

      throw new Error(
        "Permission de notification refusée."
      );

    }


    let subscription =
      await registration.pushManager.getSubscription();


    if (!subscription) {

      subscription =
        await registration.pushManager.subscribe({

          userVisibleOnly:
            true,

          applicationServerKey:
            urlBase64ToUint8Array(
              VAPID_PUBLIC_KEY
            )

        });

    }


    const subscriptionJSON =
      subscription.toJSON();


    const endpoint =
      subscriptionJSON.endpoint;

    const p256dh =
      subscriptionJSON.keys?.p256dh;

    const auth =
      subscriptionJSON.keys?.auth;


    if (
      !endpoint ||
      !p256dh ||
      !auth
    ) {

      throw new Error(
        "Impossible de récupérer les données Push."
      );

    }


    const {
      error
    } =
      await window.supabaseClient
        .from("push_subscriptions")
        .upsert(
          {

            user_id:
              user.id,

            endpoint:
              endpoint,

            p256dh:
              p256dh,

            auth:
              auth

          },
          {
            onConflict:
              "user_id,endpoint"
          }
        );


    if (error) {

      console.error(
        "PUSH DATABASE ERROR:",
        error
      );

      throw error;

    }


    status.innerHTML =
      "✅ Notifications activées sur cet appareil.";

    button.textContent =
      "🔔 Notifications activées";

    button.disabled =
      true;


    console.log(
      "✅ Push subscription enregistrée."
    );


  } catch (error) {

    console.error(
      "PUSH ERROR:",
      error
    );


    status.innerHTML =
      "❌ " +
      error.message;


    button.disabled =
      false;

    button.textContent =
      "🔔 Activer les notifications";

  }

}


// ========================================
// PUSH BUTTON
// ========================================

const enablePush =
  document.getElementById(
    "enablePush"
  );

if (enablePush) {

  enablePush.addEventListener(
    "click",
    enablePushNotifications
  );

}


// ========================================
// AUTH EVENTS
// ========================================

window.supabaseClient.auth
  .onAuthStateChange(
    (event, session) => {

      console.log(
        "AUTH EVENT:",
        event
      );

    }
  );


// ========================================
// START SERVICE WORKER
// ========================================

if (
  "serviceWorker" in navigator
) {

  window.addEventListener(
    "load",
    () => {

      registerServiceWorker();

    }
  );

}
