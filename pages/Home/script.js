// import { logout, verifyLogin, auth, col, addDocument, db } from "../../firebase-init.js";
import { db, verifyLogin, auth } from "../../firebase-init.js";
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";

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
    }).then(() => findMessages());
    // console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

const findUser = () => {
  return auth.currentUser;
};

const findMessages = async () => {
  const querySnapshot = await getDocs(collection(db, "messages"));
  let messages = [];
  querySnapshot.forEach((doc) => {
    messages.push(doc.data());
  });
  console.log("messages: ", messages);
  return messages;
};

// findMessages();
