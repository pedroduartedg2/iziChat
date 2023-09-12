import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { GoogleAuthProvider, getAuth, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCi3G9zl06b8e8ui6O0pWtCQ5JY8PbZepg",
  authDomain: "izichat-71bde.firebaseapp.com",
  projectId: "izichat-71bde",
  storageBucket: "izichat-71bde.appspot.com",
  messagingSenderId: "1096717886083",
  appId: "1:1096717886083:web:e64a39ef4302b21d70b1b6",
};
const app = initializeApp(firebaseConfig);

const provider = new GoogleAuthProvider();
export const auth = getAuth(app);
export const db = getFirestore(app);


export const signInWitchGoogle = () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      const name = result.user.displayName;
      const email = result.user.email;
      const profilePic = result.user.photoURL;

      localStorage.setItem("name", name);
      localStorage.setItem("email", email);
      localStorage.setItem("profilePic", profilePic);

      window.location.href = "/pages/Rooms/rooms.html";
    })
    .catch((error) => {
      console.log("erro: ", error);
    });
};

export const verifyLogin = () => {
  getAuth().onAuthStateChanged((user) => {
    if (!user) {
      window.location.href = "/index.html";
    }
  });
};

export const logout = () => {
  signOut(getAuth())
    .then(() => {
      localStorage.clear();
    })
    .catch((error) => {
      console.log("Erro: ", error);
    });
};
