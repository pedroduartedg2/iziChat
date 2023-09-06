import { logout, verifyLogin } from "../../firebase-init.js";

verifyLogin();

document.getElementById("logout-btn").addEventListener("click", () => {
  console.log("clicou sair");
  logout();
});
