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

const button = document.getElementById("notifications");
button.addEventListener("click", () => {
  Notification.requestPermission().then((result) => {
    if (result === "granted") {
      randomNotification();
    }
  });
});

function randomNotification() {
  const randomItem = Math.floor(Math.random());
  const notifTitle = "Título";
  const notifBody = `Mensagem da notificação`;
  const notifImg = "../../src/logo.png";
  const options = {
    body: notifBody,
    icon: notifImg,
  };
  new Notification(notifTitle, options);
  setTimeout(randomNotification, 30000);
}

// Verifique se o navegador suporta notificações
// if ("Notification" in window) {
//   // Verifique se as notificações estão desativadas
//   if (Notification.permission !== "granted" && Notification.permission !== "denied") {
//     // Solicite permissão para enviar notificações
//     Notification.requestPermission().then(function (permission) {
//       if (permission === "granted") {
//         console.log("Permissão concedida para enviar notificações!");
//       } else {
//         console.warn("Permissão negada para enviar notificações.");
//       }
//     });
//   }
// }

// // Verifique se o navegador suporta notificações
// if ("Notification" in window && Notification.permission === "granted") {
//   // Crie e exiba a notificação
//   var notification = new Notification("Título da Notificação", {
//     body: "Este é o corpo da notificação.",
//     icon: "icone.png", // Substitua "icone.png" pelo URL da imagem do ícone desejado.
//   });

//   // Defina um evento de clique na notificação (opcional)
//   notification.onclick = function () {
//     console.log("A notificação foi clicada.");
//     // Você pode adicionar ações a serem executadas ao clicar na notificação.
//   };
// } else if (Notification.permission !== "denied") {
//   // Se a permissão não foi negada, solicite novamente
//   Notification.requestPermission().then(function (permission) {
//     if (permission === "granted") {
//       console.log("Permissão concedida para enviar notificações!");
//     } else {
//       console.warn("Permissão negada para enviar notificações.");
//     }
//   });
// }
