importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyCDGPZk78NR4fJa6nlSLDEn1oGwOo46FsI",
    authDomain: "project-1-b05f6.firebaseapp.com",
    projectId: "project-1-b05f6",
    messagingSenderId: "784504248110",
    appId: "1:784504248110:web:efef40e52a2ff8e3290cbf",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message: ", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
