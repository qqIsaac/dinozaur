const config = {
  minCactusInterval: 1000,
  maxCactusInterval: 1700,
};
const Player = document.querySelector(".player");
const Enemies = document.querySelector(".enemies");
const Cactuses = document.getElementsByClassName("cactus");
const ModalStart = document.querySelector(".modal_start");
const ModalStartButton = document.querySelector(".modal_start .button");
const ModalEnd = document.querySelector(".modal_end");
const ModalRestartButton = ModalEnd.querySelector(".button_restart");
const ModalResultButton = ModalEnd.querySelector(".button_rates");
const ModalResult = ModalEnd.querySelector(".results");
let st_injump = false;
let st_started = false;
let st_finished = false;
let result = 0;

document.addEventListener("keydown", handleKeyDown);

function handleKeyDown(event) {
  if (st_started === false) {
    return null;
  }
  if (event.code === "Space") {
    if (st_injump === false) {
      Player.classList.add("jump");
      st_injump = true;
    }
  }
}

Player.addEventListener("transitionend", handleTransitionendEvent);

function handleTransitionendEvent(event) {
  if (Player.classList.contains("jump")) {
    Player.classList.remove("jump");
  } else if (event.propertyName === "margin-bottom") {
    st_injump = false;
  }
}

document.addEventListener("transitionend", removeCactus);

function createCactus() {
  if (st_finished) return false;

  const cactus = document.createElement("div");

  cactus.style.left = Enemies.getBoundingClientRect().width + "px";
  cactus.classList.add("cactus");
  Enemies.appendChild(cactus);
  setTimeout(() => {
    cactus.style.left = cactus.getBoundingClientRect().width * -1 + "px";
  }, 1);
  mathRandom = updateCactusesInterval(
    config.minCactusInterval,
    config.maxCactusInterval
  );
  setTimeout(createCactus, mathRandom);
}

function removeCactus(e) {
  if (st_finished === true) return false;
  if (e.target.classList.contains("cactus")) {
    let cactus = e.target;
    cactus.removeEventListener("transitionend", removeCactus);
    cactus.parentNode.removeChild(cactus);
  }
}

function onload() {
  ModalStartButton.addEventListener("click", startGame);
}

let game_interval;
let interval_spawn_cactuses;
let mathRandom = updateCactusesInterval(
  config.minCactusInterval,
  config.maxCactusInterval
);

function startGame() {
  ModalStart.classList.add("hidden");
  createCactus();

  st_started = true;
  game_interval = setInterval(() => {
    updateResult();
    let coord1 = Player.getBoundingClientRect();
    for (let n = 0; n < Cactuses.length; n++) {
      let coord2 = Cactuses[n].getBoundingClientRect();
      if (checkInter(coord1, coord2)) {
        console.log("u lose");
        st_finished = true;
        endGame();
      }
    }
  }, 30);
}

function checkInter(coord1, coord2) {
  if (coord1.x > coord2.x + coord2.width) return false;
  if (coord1.x + coord1.width < coord2.x) return false;
  if (coord1.y > coord2.y + coord2.height) return false;
  if (coord1.y + coord1.height < coord2.y) return false;
  return true;
}

const cactusesCoords = [];

function endGame() {
  st_started = false;
  clearInterval(game_interval);
  clearInterval(interval_spawn_cactuses);
  for (let n = 0; n < Cactuses.length; n++) {
    cactusesCoords[n] = Cactuses[n].getBoundingClientRect().x;
    Cactuses[n].classList.add("no-transition");
    setTimeout(() => {
      Cactuses[n].style.left = cactusesCoords[n] + "px";
    }, 1);
  }
  ModalEnd.classList.remove("hidden");
  saveResult();
}

const ResultTitle = document.querySelector(".result__title");

function updateResult() {
  result = result + 1;
  ResultTitle.textContent = result;
}

function updateCactusesInterval(min, max) {
  return Math.random() * (max - min) + min;
}

ModalRestartButton.addEventListener("click", restartGame);

function restartGame() {
  location.reload();
}

function saveResult() {
  let allRates = JSON.parse(localStorage.getItem("DinoGameRates"));
  if (allRates === null) {
    allRates = [];
  }
  let date = new Date();
  let formatDate = `${date.getDate()}.${
    date.getMonth() + 1
  }.${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  const rate = {
    date: formatDate,
    result: result,
  };
  allRates.push(rate);
  console.log(allRates);
  localStorage.setItem("DinoGameRates", JSON.stringify(allRates));
}

ModalResultButton.addEventListener("click", showRates);

function showRates() {
  ModalResultButton.classList.add("hidden");
  ModalResult.classList.remove("hidden");
  const results = JSON.parse(localStorage.getItem("DinoGameRates"));
  results.sort((a, b) => {
    return b.result - a.result;
  });
  console.log(results);
  for (let n = 0; n <= results.length; n++) {
    viewResult(n, results[n].date, results[n].result);
  }
}

function viewResult(pos, date, value) {
  const res = document.createElement("div");
  res.classList.add("result__item");
  const spanPos = document.createElement("span");
  spanPos.classList.add("pos");
  spanPos.textContent = pos + 1;
  res.appendChild(spanPos);
  const spanDate = document.createElement("span");
  spanDate.classList.add("date");
  spanDate.textContent = date;
  res.appendChild(spanDate);
  const spanValue = document.createElement("span");
  spanValue.classList.add("value");
  spanValue.textContent = value;
  res.appendChild(spanValue);
  ModalResult.appendChild(res);
}