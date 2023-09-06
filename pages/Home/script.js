import { logout, verifyLogin } from "../../firebase-init.js";

verifyLogin();

document.getElementById("logout-btn").addEventListener("click", () => {
  logout();
});

document.getElementById("send-btn").addEventListener("click", () => {
  let message = document.getElementById("input-message").value;
  console.log(message);
});

const sendMessage = () => {};
