import { signInWitchGoogle } from "../firebase-init.js";

document.getElementById("login-btn").addEventListener("click", () => {
  signInWitchGoogle();
});
