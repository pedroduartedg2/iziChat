import { signInWitchGoogle } from "../firebase.js";

document.getElementById("login-btn").addEventListener("click", () => {
  signInWitchGoogle();
});
