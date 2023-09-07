// import { logout, verifyLogin, auth, col, addDocument, db } from "../../firebase-init.js";
import { db, verifyLogin, auth, logout } from "../../firebase-init.js";
import { collection, addDoc, getDocs, query, orderBy, limit, onSnapshot, doc } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";

verifyLogin();

document.getElementById("logout-btn").addEventListener("click", () => {
  logout();
});

document.getElementById("send-btn").addEventListener("click", () => {
  let inputMessage = document.getElementById("input-message");

  if (inputMessage.value) {
    sendMessage(inputMessage.value);
    inputMessage.value = "";
    inputMessage.focus();
  } else {
    console.log("Digite um valor");
  }
});

const sendMessage = async (message) => {
  try {
    const docRef = await addDoc(collection(db, "messages"), {
      message: message,
      created: new Date(Date.now()),
      user: {
        email: findUser().email,
        name: findUser().displayName,
        photoURL: findUser().photoURL,
        uid: findUser().uid,
      },
    }).then(() => {
      createMessages().then(() => {
        var objDiv = document.getElementById("messages-container");
        objDiv.scrollTop = objDiv.scrollHeight;
      });
      setTimeout(() => {}, 400);
    });
    // console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

const findUser = () => {
  return auth.currentUser;
};

const findMessages = async () => {
  const messagesDb = collection(db, "messages");
  const q = await query(messagesDb, orderBy("created", "asc"), limit(5000));
  const querySnapshot = await getDocs(q);

  // const querySnapshot = await getDocs(collection(db, "messages"));
  let messages = [];
  querySnapshot.forEach((doc) => {
    messages.push(doc.data());
  });
  return messages;
};

const createMessages = async (messages) => {
  console.log("messages:::::", messages);
  // let messages = await findMessages();
  let allMessages = "";
  messages.forEach((message) => {
    let messageBoxOthers = "";
    let messageOthers = "";
    if (message.user.uid != findUser().uid) {
      messageBoxOthers = "message-box-others";
      messageOthers = "message-others";
    }
    let HTML = `<div class="message-box ${messageBoxOthers}">
      <div class="message ${messageOthers}">
        <p>${message.message}</p>
        <img src="${message.user.photoURL}" alt="" />
      </div>
    </div>`;
    allMessages += HTML;
  });
  document.getElementById("messages-container").innerHTML = allMessages;
};

// let alturaBoxInput = document.getElementById("input-container").clientHeight;
// let alturaHeader = document.querySelector("header").clientHeight;

// document.getElementById("messages-container").style.height = "calc(100vh - " + (Number(alturaBoxInput) + Number(alturaHeader) + 8) + "px)";

document.addEventListener(
  "keypress",
  function (e) {
    if (e.which == 13) {
      document.getElementById("send-btn").click();
    }
  },
  false
);

createMessages().then(() => {
  var objDiv = document.getElementById("messages-container");
  console.log(objDiv.scrollHeight);
  objDiv.scrollTop = objDiv.scrollHeight;
});

// onSnapshot(doc(db, "messages", "messages"), (doc) => {
//   console.log("doc: ", doc);
//   console.log("Current data: ", doc.data());
// });

const messagesDb = collection(db, "messages");
const q = await query(messagesDb, orderBy("created", "asc"), limit(5000));

onSnapshot(q, (snapshot) => {
  let messages = [];
  snapshot.docs.forEach((doc) => {
    messages.push({ ...doc.data(), id: doc.id });
  });
  console.log("messages: ", messages);
  createMessages(messages);
});
