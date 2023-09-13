import { db, verifyLogin, auth, logout, firebaseApp } from "../../firebase.js";
import { collection, addDoc, getDocs, query, orderBy, limit, onSnapshot, doc } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-messaging.js";
// import { onBackgroundMessage } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-messaging-sw.js";

const messaging = getMessaging(firebaseApp);
getToken(messaging, { vapidKey: "BADmmifRCwDh11VTjsaEL7Af3B6aNHlH5bhNbB6dag73v2BY4oTzm5ha6cb7HXp06sxCCxzl1Uh-dZZ26Sb63u8" })
  .then((currentToken) => {
    if (currentToken) {
      // Send the token to your server and update the UI if necessary
      // ...
      console.log("currentToken: ", currentToken);
      // document.getElementById("my-rooms-container").insertAdjacentElement("beforeend", currentToken);
    } else {
      // Show permission request UI
      console.log("No registration token available. Request permission to generate one.");
      // ...
    }
  })
  .catch((err) => {
    console.log("An error occurred while retrieving token. ", err);
    // ...
  });

function requestPermission() {
  console.log("Requesting permission...");
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      document.getElementById("box-notifications").style.display = "none";
      console.log("Notification permission granted.");
    } else {
      Notification.requestPermission();
    }
  });
}

requestPermission();

const sendNotification = () => {
  const notification = new Notification("Exemplo notification", {
    body: "teste",
    data: { hello: "world" },
    icon: "../../src/icon.svg",
  });
};

document.getElementById("sendNotification").addEventListener("click", () => sendNotification());

onMessage(messaging, (payload) => {
  console.log("Message received. ", payload);
  // ...
});

// const enviaMsg = async () => {
//   await fetch("https://fcm.googleapis.com//v1/projects/izichat-71bde/messages:send", {
//     method: "POST",
//     body: JSON.stringify({
//       message: {
//         token: "d2IPrdiDdbgR6YBXWWl_XG:APA91bHo8u10oebqiZmM3rTKPcFm0a0SXtpqtW_C6M0YqlbIWuT2UDEaD6GKp1ulaCLtiSgACixolY8ug7oIbxDIHfqTuAiC2PFltn0WzXqG_e_RwXzgUWVBAvJF62khCcdxbsccF8_w",
//         notification: {
//           title: "FCM Message",
//           body: "This is a message from FCM",
//         },
//         webpush: {
//           headers: {
//             Urgency: "high",
//           },
//           notification: {
//             body: "This is a message from FCM to web",
//             requireInteraction: "true",
//             badge: "/badge-icon.png",
//           },
//         },
//       },
//     }),
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: "Bearer AAAA_1l64oM:APA91bG-UvblXSuRKVhvHOrANkIrQjsyu7-toihK0nbJk5Ft9PTLKaEKGa0_eAgDoh3kNNmPcZEPk6BWoAflbJX-v_RF-Kk1hP7Wjdy390ZQ_2Ajh7P1qXd7NFMH-fwhpF2lOd11g1dX",
//     },
//   }).then((e) => {
//     console.log("mensagem enviada", e);
//   });
// };

// await enviaMsg();

// onBackgroundMessage(messaging, (payload) => {
//   console.log("[firebase-messaging-sw.js] Received background message ", payload);
//   // Customize notification here
//   const notificationTitle = "Background Message Title";
//   const notificationOptions = {
//     body: "Background Message body.",
//     icon: "/firebase-logo.png",
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
// });

document.getElementById("box-notifications").addEventListener("click", () => {
  requestPermission();
});

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

const createRooms = async (rooms) => {
  console.log(rooms);
  let myRooms = "";
  let allRooms = "";
  let HTML = "";
  rooms.forEach((room) => {
    if (room.user.uid == findUser().uid) {
      HTML = `
        <a id="${room.id}" class="room-card" href="../Home/home.html?r=${room.id}">
          <h5 class="room-title">${room.name}</h5>
          <div class="room-box-img">
          <p>Você</p>
          <img class="room-img-creator" src="${room.user.photoURL}"></img>
        </div>
          </a>`;
      myRooms += HTML;
    } else {
      HTML = `
          <a id="${room.id}" class="room-card" href="../Home/home.html?r=${room.id}">
          <h5 class="room-title">${room.name}</h5>
          <div class="room-box-img">
            <p>${room.user.name.split(" ") ? room.user.name.split(" ")[0] : room.user.name}</p>
            <img class="room-img-creator" src="${room.user.photoURL}"></img>
          </div>
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
