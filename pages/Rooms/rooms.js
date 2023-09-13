import { db, verifyLogin, auth, logout, firebaseApp } from "../../firebase.js";
import { collection, addDoc, getDocs, query, orderBy, limit, onSnapshot, doc } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-messaging.js";
// import { onBackgroundMessage } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-messaging-sw.js";

// const messaging = getMessaging(firebaseApp);
// getToken(messaging, { vapidKey: "BADmmifRCwDh11VTjsaEL7Af3B6aNHlH5bhNbB6dag73v2BY4oTzm5ha6cb7HXp06sxCCxzl1Uh-dZZ26Sb63u8" })
//   .then((currentToken) => {
//     if (currentToken) {
//       // Send the token to your server and update the UI if necessary
//       // ...
//       console.log("currentToken: ", currentToken);
//       // document.getElementById("my-rooms-container").insertAdjacentElement("beforeend", currentToken);
//     } else {
//       // Show permission request UI
//       console.log("No registration token available. Request permission to generate one.");
//       // ...
//     }
//   })
//   .catch((err) => {
//     console.log("An error occurred while retrieving token. ", err);
//     // ...
//   });

// function requestPermission() {
//   console.log("Requesting permission...");
//   Notification.requestPermission().then((permission) => {
//     if (permission === "granted") {
//       console.log("Notification permission granted.");
//     } else {
//       Notification.requestPermission();
//       document.getElementById("box-notifications").style.display = "flex";
//     }
//   });
// }

// requestPermission();

// onMessage(messaging, (payload) => {
//   console.log("Message received. ", payload);
//   // ...
// });

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
