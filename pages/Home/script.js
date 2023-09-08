// import { logout, verifyLogin, auth, col, addDocument, db } from "../../firebase-init.js";
import { db, verifyLogin, auth, logout } from "../../firebase-init.js";
import { collection, addDoc, getDocs, query, orderBy, limit, onSnapshot, doc } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";

verifyLogin();

document.getElementById("logout-btn-modal").addEventListener("click", () => {
  document.getElementById("boxLoader").style.display = "flex";
  logout().then(() => {
    document.getElementById("boxLoader").style.display = "none";
  });
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

function getTimestampDataOntem() {
  const dataOntem = new Date(); // Obtém a data atual
  dataOntem.setDate(dataOntem.getDate() - 1); // Subtrai um dia

  const timestamp = dataOntem.getTime(); // Obtém o timestamp em milissegundos

  return timestamp;
}

const sendMessage = async (message) => {
  try {
    const docRef = await addDoc(collection(db, "messages"), {
      message: message,
      created: new Date(),
      user: {
        email: findUser().email,
        name: findUser().displayName,
        photoURL: findUser().photoURL,
        uid: findUser().uid,
      },
    });
    // .then(() => {
    //   createMessages().then(() => {
    //     var objDiv = document.getElementById("messages-container");
    //     objDiv.scrollTop = objDiv.scrollHeight;
    //   });
    //   setTimeout(() => {}, 400);
    // });
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

function isHoje(data) {
  const dataAtual = new Date(); // Obtém a data atual
  const diaAtual = dataAtual.getDate();
  const mesAtual = dataAtual.getMonth() + 1; // Mês é base 0, então adicionamos 1
  const anoAtual = dataAtual.getFullYear();

  const diaData = data.getDate();
  const mesData = data.getMonth() + 1; // Mês é base 0, então adicionamos 1
  const anoData = data.getFullYear();

  // Compara ano, mês e dia para determinar se a data é hoje
  return diaData === diaAtual && mesData === mesAtual && anoData === anoAtual;
}

function isOntem(data) {
  const dataOntem = new Date(); // Obtém a data atual
  dataOntem.setDate(dataOntem.getDate() - 1); // Subtrai um dia para obter a data de ontem

  // Compara ano, mês e dia para determinar se a data é igual à de ontem
  return data.getDate() === dataOntem.getDate() && data.getMonth() === dataOntem.getMonth() && data.getFullYear() === dataOntem.getFullYear();
}

function isDataMenorQueOntem(data) {
  const dataOntem = new Date(); // Obtém a data atual
  dataOntem.setDate(dataOntem.getDate() - 1); // Subtrai um dia para obter a data de ontem

  // Compara as datas usando o método getTime() que retorna o timestamp em milissegundos
  return data.getTime() < dataOntem.getTime();
}

function estaDentroDeSeteDias(data) {
  const dataAtual = new Date(); // Obtém a data atual
  const limite = 7 * 24 * 60 * 60 * 1000; // 7 dias em milissegundos

  // Calcula a diferença em milissegundos entre as duas datas
  const diferenca = data - dataAtual;

  // Verifica se a diferença está dentro do limite de 7 dias
  return diferenca <= limite;
}

function obterNomeDoDiaDaSemana(data) {
  const diaDaSemanaNumero = data.getDay(); // Obtém o número do dia da semana (0 a 6)

  // Crie um objeto que mapeia os números do dia da semana para os nomes dos dias
  const nomesDosDias = {
    0: "Domingo",
    1: "Segunda",
    2: "Terça",
    3: "Quarta",
    4: "Quinta",
    5: "Sexta",
    6: "Sábado",
  };

  // Use o objeto para obter o nome do dia da semana
  return nomesDosDias[diaDaSemanaNumero] || "Dia inválido";
}

const formatDate = (timestamp) => {
  let agora = new Date();
  let diferencaEmMilissegundos = Math.abs(new Date(timestamp.seconds * 1000) - agora);
  let limiteEmMilissegundos = 1 * 60 * 1000; // 1 minuto
  let time = new Date(timestamp.seconds * 1000);

  if (diferencaEmMilissegundos <= limiteEmMilissegundos) {
    return "agora";
  } else {
    let hora = time.getHours();
    let minutos = time.getMinutes();
    if (minutos < 10) minutos = "0" + minutos;
    if (hora < 10) hora = "0" + hora;
    if (isHoje(time)) {
      return hora + ":" + minutos;
    } else if (isOntem(time)) {
      return "Ontem " + hora + ":" + minutos;
    } else if (estaDentroDeSeteDias(time)) {
      return obterNomeDoDiaDaSemana(time) + " " + hora + ":" + minutos;
    } else if (isDataMenorQueOntem(time)) {
      let dia = time.getDate();
      let mes = time.getMonth() + 1;
      if (dia < 10) dia = "0" + dia;
      if (mes < 10) mes = "0" + mes;
      return dia + "/" + mes + " " + hora + ":" + minutos;
    }
  }
};

const createMessages = async (messages) => {
  // console.log("messages:::::", messages);
  // let messages = await findMessages();
  let allMessages = "";
  messages.forEach((message) => {
    let messageBoxOthers = "";
    let messageOthers = "";
    let name = "";
    let divName = "";
    if (message.user.uid != findUser().uid) {
      messageBoxOthers = "message-box-others";
      messageOthers = "message-others";
      name = message.user.name;
      divName = `<span class="name-message"">${name}</span>`;
    }
    let HTML = `
    <div class="message-box ${messageBoxOthers}">
    <div class="message ${messageOthers}">
    <div>
      ${divName}
      <span class="message-text-box">
        <p class="message-text">${message.message}</p>
        <p class="time-message">${formatDate(message.created)}</p>
      </span>
    </div>
        <img src="${message.user.photoURL}" alt="" />
      </div>
    </div>`;
    allMessages += HTML;
  });
  document.getElementById("messages-container").innerHTML = allMessages;
};

document.addEventListener(
  "keypress",
  function (e) {
    if (e.which == 13) {
      document.getElementById("send-btn").click();
    }
  },
  false
);

const rollEnd = () => {
  window.scrollTo(0, document.body.scrollHeight);
};

const start = async () => {
  document.getElementById("boxLoader").style.display = "flex";
  const messagesDb = collection(db, "messages");
  const q = await query(messagesDb, orderBy("created", "asc"), limit(5000));

  await onSnapshot(q, (snapshot) => {
    let messages = [];
    snapshot.docs.forEach((doc) => {
      messages.push({ ...doc.data(), id: doc.id });
    });
    // console.log("messages: ", messages);
    createMessages(messages).then(() => {
      document.getElementById("boxLoader").style.display = "none";
      rollEnd();
    });
  });
};

// Função para verificar a posição de rolagem
function verificaRolagem() {
  var distanciaRolada = window.scrollY || window.pageYOffset;
  var divFlutuante = document.getElementById("div-flutuante");

  if (distanciaRolada < 200) {
    // Ajuste o valor conforme necessário
    divFlutuante.style.display = "block";
  } else {
    divFlutuante.style.display = "none";
  }
}

// Verificar a posição de rolagem quando a página é rolada
window.addEventListener("scroll", verificaRolagem);

// Função para rolar a página para o final
function rolarParaOFinal() {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth", // Rolar suavemente para o final
  });
}

// Adicione um evento de clique à div
var divFlutuante = document.getElementById("div-flutuante");
divFlutuante.addEventListener("click", rolarParaOFinal);

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

// const arrayObjetos = [
//   { chave: "valor1" },
//   { chave: "valor2" },
//   { chave: "valor1" },
//   { chave: "valor3" },
// ];

// arrayObjetos.forEach((elemento, index, array) => {
//   if (index < array.length - 1) {
//     const proximoElemento = array[index + 1];
//     if (elemento.chave === proximoElemento.chave) {
//       console.log(`O elemento ${index + 1} possui a mesma chave que o próximo elemento.`);
//     }
//   }
// });
