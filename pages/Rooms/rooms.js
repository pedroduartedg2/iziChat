import { db, verifyLogin, auth, logout } from "../../firebase.js";
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

const createRooms = async (rooms) => {
  console.log(rooms);
  let myRooms = "";
  let allRooms = "";
  let HTML = "";
  rooms.forEach((room) => {
    if (room.user.uid == findUser().uid) {
      HTML = `
        <a id="${room.id}" class="room-card" href="../Home/home.html?r=${room.id}">
          <h5>${room.name}</h5>
          <div class="room-box-img">
          <p>Você</p>
          <img class="room-img-creator" src="${room.user.photoURL}"></img>
        </div>
          </a>`;
      myRooms += HTML;
    } else {
      HTML = `
          <a id="${room.id}" class="room-card" href="../Home/home.html?r=${room.id}">
          <h5>${room.name}</h5>
          <div class="room-box-img">
            <p>${room.user.name.split(" ")[0]}</p>
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
