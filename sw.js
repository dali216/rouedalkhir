/* =========================
   PUSH NOTIFICATIONS
========================= */

if ("serviceWorker" in navigator) {

  window.addEventListener("load", async () => {

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

    } catch (error) {

      console.error(
        "❌ Service Worker error:",
        error
      );

    }

  });

}
