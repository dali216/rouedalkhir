const CACHE_NAME = "roued-al-khair-v1";

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    self.clients.claim()
  );
});


/*
  استقبال Push Notification
*/

self.addEventListener("push", event => {

  let data = {};

  try {
    data = event.data
      ? event.data.json()
      : {};
  } catch (error) {

    data = {
      title: "Roued Al Khair",
      body: event.data
        ? event.data.text()
        : "Vous avez une nouvelle notification."
    };

  }


  const title =
    data.title ||
    "Roued Al Khair";


  const options = {

    body:
      data.body ||
      "Vous avez une nouvelle notification.",

    icon:
      data.icon ||
      "icon-192.png",

    badge:
      data.badge ||
      "icon-192.png",

    data: {
      url:
        data.url ||
        "notifications.html"
    },

    vibrate: [
      200,
      100,
      200
    ],

    requireInteraction:
      false

  };


  event.waitUntil(

    self.registration.showNotification(
      title,
      options
    )

  );

});


/*
  Quand l'utilisateur clique
  sur la notification
*/

self.addEventListener(
  "notificationclick",
  event => {

    event.notification.close();


    const url =
      event.notification.data?.url ||
      "notifications.html";


    event.waitUntil(

      clients.matchAll({
        type: "window",
        includeUncontrolled: true
      }).then(
        windowClients => {

          for (
            const client of windowClients
          ) {

            if (
              client.url.includes(
                "rouedalkhir"
              )
            ) {

              client.focus();

              client.navigate(url);

              return;

            }

          }


          return clients.openWindow(url);

        }
      )

    );

  }
);
