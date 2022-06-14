import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.2/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue
} from "https://www.gstatic.com/firebasejs/9.8.2/firebase-database.js";

window.addEventListener("load", eventos);

let url, data, val, regist, miJSON, Q, preguntas;
let marcador = 0;
let contador = 1;

let home = document.getElementById("home");
let question = document.getElementById("question");
let select = document.getElementById("option");
let mainB = document.getElementById("mainBody");
let submit = document.getElementById("submit");
let start = document.getElementById("start");

function eventos() {
  //PANTALLA HOME
  try {
    submit.addEventListener("click", async (evento) => {
      evento.preventDefault();
      saveStorage(await choose());
    });
  } catch (error) {
    console.log("No estás en HOME.HTML");
  }
  //PANTALLA QUIZ
  try {
    start.addEventListener("click", async () => {
      start.disabled = true;
      let lastRegistry = await recoverStorage();
      Q = await queryThis(lastRegistry.category);
      if (lastRegistry.category<=32) displayTest(Q);
    });
  } catch (error) {
    console.log("No estás en QUESTION.HTML");
  }
}
//1
async function choose() {
  val = await select.options[select.selectedIndex].value;
  return val;
}
//2
async function saveStorage(valor) {
  if (localStorage.lenght === null || localStorage.lenght == 0) {
    regist = 1;
  } else {
    regist = localStorage.length + 1;
  }
  miJSON = {
    id: regist,
    category: valor,
    score: null,
    time: null,
  };
  const datos = JSON.stringify(miJSON);
  localStorage.setItem(regist, datos);
  question.setAttribute("class", "width8em solid active");
  home.setAttribute("class", "width8em solid disabled");
  submit.disabled = true;
}
//3
async function recoverStorage() {
  regist = localStorage.length;
  return await JSON.parse(localStorage.getItem(regist));
}
//4
async function queryThis(thing) {
  thing = parseInt(thing, 10);
  if (thing <= 32) {
    url = `https://opentdb.com/api.php?amount=10&category=${thing}&type=multiple`;
    data = await fetch(url).then((response) => response.json());
    console.log(data.results);
    return data.results;
  } else {
    const firebaseConfig = {
      apiKey: "AIzaSyB9mXUNAQoSaXzjX0Ot7xTAVI7xuSMbFJQ",
      authDomain: "proyectico-21532.firebaseapp.com",
      databaseURL:
        "https://proyectico-21532-default-rtdb.europe-west1.firebasedatabase.app",
      projectId: "proyectico-21532",
      storageBucket: "proyectico-21532.appspot.com",
      messagingSenderId: "906827652319",
      appId: "1:906827652319:web:02bba21d4532ee07a51d6a",
    };
    let app = initializeApp(firebaseConfig);
    app = getData(app);
    return app;
  }
}
//4.b
function getData(elem) {
  const database = getDatabase(elem);
  const refQuestion = ref(database, "results/");
  onValue(refQuestion, snapshot => {
    Q = snapshot.val();
    console.log(Q);
    //atajo cutre
    displayTest(Q);
  });
  return Q;
}
//5
async function displayTest(elem) {
  let form = document.createElement("form");
  form.setAttribute("id", "test");
  form.setAttribute("class", "center");
  mainB.append(form);
  let num = 0;
  preguntas = [];
  elem.forEach((q) => {
    let div = document.createElement("div");
    num++;

    let correcta =
      "" +
      `<label for="${num}">${q.correct_answer}</label>
    <input type="radio" name="${num}" id="right" ></br>`;
    preguntas.push(correcta);

    let incorrectas = [];
    for (let index = 0; index < 3; index++) {
      incorrectas[index] =
        "" +
        `<label for="${num}">${q.incorrect_answers[index]}</label>
      <input type="radio" name="${num}" id="wrong" ></br>`;
      preguntas.push(incorrectas[index]);
    }

    shuffleThis(preguntas);

    div.innerHTML = `<p>${q.question}</p>
                        ${preguntas[0]} 
                        ${preguntas[1]} 
                        ${preguntas[2]} 
                        ${preguntas[3]} 
                    `;
    if (num > 1) {
      div.setAttribute("id", `q${num}`);
    } else {
      div.setAttribute("id", `p1`);
    }
    preguntas = []; //vaciamos el array una vez ha sido usado
    form.append(div);
  });
  let right = document.querySelectorAll('#right');
  let wrong = document.querySelectorAll('#wrong');
  [...right].forEach(r => {
    r.addEventListener('click', sumaPuntos);
  });
  [...wrong].forEach(w => {
    w.addEventListener('click', sigPregunta);
  });
  start.disabled = true;
}
//6
function shuffleThis(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
//7
function sigPregunta() {
  let currentQuestion = document.getElementById(`p${contador}`);
  currentQuestion.setAttribute("id", "hidden");
  contador++;
  if (contador <= 10) {
    let nextQuestion = document.getElementById(`q${contador}`);
    nextQuestion.setAttribute("id", `p${contador}`);
  } else {
    saveScore();
    displayScore();
    question.setAttribute("class", "width8em solid disabled");
    home.setAttribute("class", "width8em solid active");
  }
}
//8
function sumaPuntos() {
  marcador++;
  sigPregunta();
}
//9
async function saveScore() {
  let datos = await recoverStorage();
    miJSON = {
      id: datos.id,
      category: datos.category,
      score: marcador,
      time: new Date(),
    };
  const cosa = JSON.stringify(miJSON);
  localStorage.setItem(datos.id, cosa);
}
//10
function displayScore() {
  let div = document.createElement("div");
  div.innerHTML = "" + `<b>¡Has conseguido ${marcador} puntos de 10! </b>`;
  div.setAttribute("class", "center");
  mainB.append(div);
}
