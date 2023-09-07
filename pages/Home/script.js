// import { logout, verifyLogin, auth, col, addDocument, db } from "../../firebase-init.js";
import { db, verifyLogin, auth, logout } from "../../firebase-init.js";
import { collection, addDoc, getDocs, query, orderBy, limit, onSnapshot, doc } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";

verifyLogin();

document.getElementById("logout-btn").addEventListener("click", () => {
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
  console.log("messages:::::", messages);
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
  var objDiv = document.getElementById("messages-container");
  console.log(objDiv.scrollHeight);
  objDiv.scrollTop = objDiv.scrollHeight;
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
    console.log("messages: ", messages);
    createMessages(messages).then(() => {
      document.getElementById("boxLoader").style.display = "none";
      rollEnd();
    });
  });
};

const divFlutuante = document.getElementById("div-flutuante");
const messagesContainer = document.getElementById("messages-container");

// Variável para controlar a exibição do botão
let exibirBotao = false;

messagesContainer.addEventListener("scroll", () => {
  const scrollTop = messagesContainer.scrollTop;
  const scrollHeight = messagesContainer.scrollHeight;
  const clientHeight = messagesContainer.clientHeight;

  // Calcular 10% da altura da div
  const dezPorcento = (scrollHeight - clientHeight) * 0.9;

  // Verifique se a rolagem é maior que 10% da altura da div para exibir o botão
  if (scrollTop > dezPorcento) {
    exibirBotao = true;
  } else {
    exibirBotao = false;
  }

  // Exiba ou oculte o botão com base na variável exibirBotao
  if (exibirBotao) {
    divFlutuante.classList.remove("active");
  } else {
    divFlutuante.classList.add("active");
  }
});

divFlutuante.addEventListener("click", () => {
  // Adicione o efeito suave ao rolar para o início da div "messages-container"
  messagesContainer.style.scrollBehavior = "smooth";

  // Role para o início da div "messages-container" quando a div flutuante é clicada
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // Remova o efeito suave após a rolagem
  setTimeout(() => {
    messagesContainer.style.scrollBehavior = "auto";
  }, 1000); // Ajuste o tempo conforme necessário
});

document.getElementById("profile-pic").setAttribute("src", localStorage.getItem("profilePic"));

start();
