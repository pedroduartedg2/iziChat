// import { logout, verifyLogin, auth, col, addDocument, db } from "../../firebase-init.js";
import { db, verifyLogin, auth, logout } from "../../firebase-init.js";
import { collection, addDoc, getDocs, query, orderBy, limit, onSnapshot, doc } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";

verifyLogin();

document.getElementById("logout-btn-modal").addEventListener("click", () => {
  document.getElementById("boxLoader").style.display = "flex";
  logout().then(() => {
    document.getElementById("boxLoader").style.display = "none";
  });
});

document.getElementById("create-room-btn").addEventListener("click", () => {
  let inputRoomName = document.getElementById("input-room-name");

  if (inputRoomName.value) {
    createRoom(inputRoomName.value);
    inputRoomName.value = "";
  } else {
    console.log("Digite um valor");
  }
});

const createRoom = async (nameRoom) => {
  try {
    await addDoc(collection(db, "rooms"), {
      name: nameRoom,
      created: new Date(),
      user: {
        email: findUser().email,
        name: findUser().displayName,
        photoURL: findUser().photoURL,
        uid: findUser().uid,
      },
    });
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

const findUser = () => {
  return auth.currentUser;
};

// const findMessages = async () => {
//   const roomsDb = collection(db, "rooms");
//   const q = await query(roomsDb, orderBy("created", "asc"), limit(5000));
//   const querySnapshot = await getDocs(q);

//   // const querySnapshot = await getDocs(collection(db, "messages"));
//   let rooms = [];
//   querySnapshot.forEach((doc) => {
//     rooms.push(doc.data());
//   });
//   return rooms;
// };

const createRooms = async (rooms) => {
  let myRooms = "";
  let allRooms = "";
  let HTML = "";
  rooms.forEach((room) => {
    if (room.user.uid == findUser().uid) {
      HTML = `
        <a id="${room.id}" class="room-card" href="../Home/home.html?r=${room.id}">
                <h5>${room.name}</h5>
        </a>`;
      myRooms += HTML;
    } else {
      HTML = `
        <a class="room-card" href="../Home/home.html?r=${room.id}">
                <h5>${room.name}</h5>
        </a>`;
      allRooms += HTML;
    }
  });
  if (myRooms) document.getElementById("my-rooms-container").innerHTML = myRooms;
  else document.getElementById("my-rooms-container").innerHTML = "Você não possui salas.";
  if (allRooms) document.getElementById("rooms-container").innerHTML = allRooms;
  else document.getElementById("rooms-container").innerHTML = "Nenhuma sala encontrada.";
};

const start = async () => {
  //   document.getElementById("boxLoader").style.display = "flex";
  const roomsDb = collection(db, "rooms");
  const q = await query(roomsDb, orderBy("created", "asc"), limit(5000));

  await onSnapshot(q, (snapshot) => {
    let rooms = [];
    snapshot.docs.forEach((doc) => {
      rooms.push({ ...doc.data(), id: doc.id });
    });
    createRooms(rooms).then(() => {
      document.getElementById("boxLoader").style.display = "none";
    });
  });
};

document.addEventListener(
  "keypress",
  function (e) {
    if (e.which == 13) {
      document.getElementById("create-room-btn").click();
    }
  },
  false
);

document.getElementById("profile-pic").setAttribute("src", localStorage.getItem("profilePic"));

start();

// Modal

const openModalBtn = document.getElementById("logout-btn");
const modal = document.getElementById("myModal");
const cancelBtn = document.getElementById("cancel-btn");

openModalBtn.addEventListener("click", () => {
  modal.style.display = "flex";
});

cancelBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

// Notificações

// service-worker.js

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open("my-cache").then(function (cache) {
      return cache.addAll([
        // Lista de arquivos para serem armazenados em cache
        "/pages/Rooms/rooms.html",
        "/pages/Rooms/rooms.js",
        // Adicione outros arquivos estáticos aqui
      ]);
    })
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});

function solicitarPermissaoNotificacao() {
  if ("Notification" in window) {
    Notification.requestPermission()
      .then(function (permissao) {
        if (permissao === "granted") {
          console.log("Permissão concedida para notificações!");
          // Agora você pode se inscrever para notificações push
          inscreverParaNotificacoes();
        } else if (permissao === "denied") {
          console.warn("Permissão negada para notificações.");
        }
      })
      .catch(function (erro) {
        console.error("Erro ao solicitar permissão para notificações:", erro);
      });
  } else {
    console.log("Notificações não são suportadas neste navegador.");
  }
}

document.getElementById("notifications").addEventListener("click", () => solicitarPermissaoNotificacao());

// service-worker.js (atualize)

self.addEventListener("push", function (event) {
  const options = {
    body: event.data.text(),
    icon: "icone.png", // Substitua pelo URL do ícone da notificação
  };

  event.waitUntil(self.registration.showNotification("Título da Notificação", options));
});

self.addEventListener("notificationclick", function (event) {
  // Lidar com o clique na notificação, se necessário
  event.notification.close();
  // Aqui você pode redirecionar o usuário para uma página específica, por exemplo:
  // clients.openWindow('https://seusite.com/pagina-de-notificacao');
});

// main.js (sua página)

function inscreverParaNotificacoes() {
  if ("serviceWorker" in navigator && "PushManager" in window) {
    navigator.serviceWorker.ready
      .then(function (registration) {
        return registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: "SUA_CHAVE_PUBLICA_VAPID", // Substitua pela chave pública VAPID
        });
      })
      .then(function (subscription) {
        console.log("Inscrição para notificações push bem-sucedida:", subscription);
        // Você pode enviar a inscrição para o servidor aqui, se necessário
      })
      .catch(function (erro) {
        console.error("Erro ao se inscrever para notificações push:", erro);
      });
  } else {
    console.warn("Notificações push ou Service Worker não são suportados neste navegador.");
  }
}

// Código do servidor para enviar notificações push (Node.js com web-push)

// const webpush = require("web-push");

// const vapidKeys = webpush.generateVAPIDKeys();

// webpush.setVapidDetails(
//   "mailto:seu-email@gmail.com", // Seu endereço de e-mail
//   vapidKeys.publicKey,
//   vapidKeys.privateKey
// );

// const pushSubscription = {
//   endpoint: "URL_DA_INSCRICAO_DO_CLIENTE",
//   keys: {
//     auth: "CHAVE_DE_AUTENTICACAO",
//     p256dh: "CHAVE_P256DH",
//   },
// };

// const payload = JSON.stringify({
//   title: "Título da Notificação",
//   body: "Corpo da Notificação",
// });

// webpush
//   .sendNotification(pushSubscription, payload)
//   .then(() => console.log("Notificação enviada com sucesso"))
//   .catch((error) => console.error("Erro ao enviar notificação:", error));
