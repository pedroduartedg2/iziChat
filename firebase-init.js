import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { GoogleAuthProvider, getAuth, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDzZvQ1Uxp_buM4otrSUOuHO3n31Gybk-g",
  authDomain: "zapchat-6eb65.firebaseapp.com",
  projectId: "zapchat-6eb65",
  storageBucket: "zapchat-6eb65.appspot.com",
  messagingSenderId: "758476996810",
  appId: "1:758476996810:web:c12125ba8465b0190cb433",
};
const app = initializeApp(firebaseConfig);

const provider = new GoogleAuthProvider();
export const auth = getAuth(app);

export const firestore = getFirestore(app);

export const signInWitchGoogle = () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      console.log(result);
      const name = result.user.displayName;
      const email = result.user.email;
      const profilePic = result.user.photoURL;

      localStorage.setItem("name", name);
      localStorage.setItem("email", email);
      localStorage.setItem("profilePic", profilePic);

      window.location.href = "/pages/Home/home.html";
    })
    .catch((error) => console.log("erro: ", error));
};

export const verifyLogin = () => {
  getAuth().onAuthStateChanged((user) => {
    console.log("user: ", user);
    if (!user) {
      window.location.href = "/index.html";
    }
  });
};

export const logout = () => {
  signOut(getAuth())
    .then(() => {
      // Sign-out successful.
      localStorage.clear();
    })
    .catch((error) => {
      // An error happened.
    });
};
