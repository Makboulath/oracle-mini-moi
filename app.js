const state = {
  prenom: "",
  naissance: "",
  objectif: "",
  couleur: "",
  humeur: "",
  lastPrediction: "",
};

const loadLines = [
  "Mini Moi aligne les fréquences…",
  "Elle tapote l’étoile violette.",
  "Les dates se plient en origami.",
  "Une carte se détache du paquet.",
];

const openings = [
  (s) => `${s.prenom}, aujourd’hui l’air penche de ton côté.`,
  (s) => `${s.prenom}, tes signes sont bruyants. Tant mieux.`,
  (s) => `Mini Moi a vu ${s.prenom} arriver avant le formulaire.`,
];

const cores = [
  (s) => `Ton objectif — « ${s.objectif} » — n’a pas besoin d’un plan de 40 pages. Il a besoin d’un geste net avant minuit.`,
  (s) => `L’énergie « ${s.humeur} » que tu portes n’est pas un décor. C’est le moteur. Ne la dilue pas pour faire plaisir.`,
  (s) => `La couleur ${s.couleur} que tu aimes revient comme un fil. Suis-la : une décision, un look, un message. Pas trois.`,
];

const twists = [
  (s) => `Entre deux choix, prends celui qui te fait un peu peur et beaucoup rire.`,
  (s) => `Quelqu’un attend un signal de toi. Court. Direct. Sans emoji d’excuse.`,
  (s) => `La fenêtre est petite : 48 heures. Après, l’idée se refroidit.`,
  (s) => `Garde 20% d’énergie pour toi. Le reste peut circuler.`,
];

const closings = [
  `Mini Moi pose l’étoile et te laisse la suite.`,
  `Ce n’est pas un destin. C’est une permission.`,
  `Reviens demain si tu veux une autre carte. Pas avant d’avoir bougé.`,
];

const topics = {
  amour: [
    (s) => `${s.prenom}, en amour : moins de tests, plus de phrases claires. La personne juste n’a pas besoin d’un labyrinthe.`,
    (s) => `Le feeling « ${s.humeur} » colore tes échanges. Si tu es tendu·e, dis-le. Le mystère fatigue tout le monde.`,
  ],
  argent: [
    (s) => `Argent : une entrée arrive si tu nommes un prix. Aujourd’hui, pas « on verra ». Un chiffre.`,
    (s) => `${s.prenom}, coupe une dépense qui nourrit l’image, pas le projet « ${s.objectif} ».`,
  ],
  travail: [
    (s) => `Travail : envoie la version imparfaite. Le polish peut suivre. L’invisibilité, non.`,
    (s) => `Une alliance légère débloque « ${s.objectif} » plus vite qu’un solo héroïque.`,
  ],
  energie: [
    (s) => `Énergie : ton corps a déjà voté. Écoute la première envie après le café — elle a raison.`,
    (s) => `Couleur du jour : ${s.couleur}. Porte-la ou pose-la quelque part. Ancre le signal.`,
  ],
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function show(name) {
  $$(".screen").forEach((s) => s.classList.toggle("active", s.dataset.screen === name));
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function ageHint(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const n = new Date();
  let a = n.getFullYear() - d.getFullYear();
  const m = n.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && n.getDate() < d.getDate())) a--;
  return a;
}

function buildPrediction(extraTopic) {
  const s = state;
  const parts = [pick(openings)(s), pick(cores)(s), pick(twists)(s)];
  if (extraTopic && topics[extraTopic]) parts.push(pick(topics[extraTopic])(s));
  parts.push(pick(closings));
  return parts.join(" ");
}

function fillResult(text) {
  state.lastPrediction = text;
  $("#result-kicker").textContent = `carte pour ${state.prenom}`;
  $("#result-title").textContent = "Voilà ce que Mini Moi voit.";
  $("#result-body").textContent = text;
  const age = ageHint(state.naissance);
  $("#result-chips").innerHTML = [
    state.objectif && `<li>objectif · ${escapeHtml(state.objectif)}</li>`,
    state.couleur && `<li>couleur · ${escapeHtml(state.couleur)}</li>`,
    state.humeur && `<li>vibe · ${escapeHtml(state.humeur)}</li>`,
    age ? `<li>${age} ans dans le jeu</li>` : "",
  ].filter(Boolean).join("");
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

$$("[data-go]").forEach((btn) => {
  btn.addEventListener("click", () => show(btn.dataset.go));
});

$("#oracle-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  state.prenom = String(fd.get("prenom") || "").trim();
  state.naissance = String(fd.get("naissance") || "");
  state.objectif = String(fd.get("objectif") || "").trim();
  state.couleur = String(fd.get("couleur") || "").trim();
  state.humeur = String(fd.get("humeur") || "").trim();
  if (!state.prenom) return;

  show("loading");
  let i = 0;
  $("#load-line").textContent = loadLines[0];
  const tick = setInterval(() => {
    i += 1;
    $("#load-line").textContent = loadLines[i % loadLines.length];
  }, 800);

  setTimeout(() => {
    clearInterval(tick);
    fillResult(buildPrediction());
    show("result");
  }, 3400);
});

$("#share-btn").addEventListener("click", async () => {
  const payload = {
    title: "Oracle Mini Moi",
    text: `${state.prenom} — ${state.lastPrediction}`,
    url: location.href,
  };
  try {
    if (navigator.share) await navigator.share(payload);
    else {
      await navigator.clipboard.writeText(`${payload.text}\n${payload.url}`);
      $("#share-btn").textContent = "Copié";
      setTimeout(() => ($("#share-btn").textContent = "Partager"), 1600);
    }
  } catch (_) {}
});

const chat = $("#chat");
const log = $("#chat-log");
const fab = $("#fab");

function greet() {
  const name = state.prenom;
  if (name) {
    return `Bonjour ${name} 👋 Je suis Mini Moi, l'assistante personnelle de Makboulath. Que voulez-vous que je vous prédise aujourd'hui ?`;
  }
  return `Bonjour 👋 Je suis Mini Moi, l'assistante personnelle de Makboulath. Ton prénom, d’abord — ensuite je te lis.`;
}

function addBubble(text, who) {
  const div = document.createElement("div");
  div.className = `bubble ${who}`;
  div.textContent = text;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

function openChat() {
  chat.classList.add("open");
  chat.setAttribute("aria-hidden", "false");
  if (!log.childElementCount) addBubble(greet(), "bot");
  if (!state.prenom) {
    $("#chat-input").placeholder = "Ton prénom…";
  } else {
    $("#chat-input").placeholder = "Demande une prédiction…";
  }
}

function closeChat() {
  chat.classList.remove("open");
  chat.setAttribute("aria-hidden", "true");
}

fab.addEventListener("click", () => {
  chat.classList.contains("open") ? closeChat() : openChat();
});
$("#chat-close").addEventListener("click", closeChat);

function handleUserText(raw) {
  const text = raw.trim();
  if (!text) return;
  addBubble(text, "me");

  if (!state.prenom) {
    state.prenom = text.split(/\s+/)[0].replace(/[^A-Za-zÀ-ÿ-]/g, "");
    if (state.prenom) {
      addBubble(`Parfait, ${state.prenom}. Amour, argent, travail — ou un sujet à toi.`, "bot");
      $("#chat-input").placeholder = "Demande une prédiction…";
      return;
    }
  }

  const lower = text.toLowerCase();
  let topic;
  if (/amour|crush|coeur|cœur|love/.test(lower)) topic = "amour";
  else if (/argent|thune|sous|money|facture/.test(lower)) topic = "argent";
  else if (/travail|job|boulot|projet|collab/.test(lower)) topic = "travail";
  else if (/énergie|energie|fatigue|vibe|humeur/.test(lower)) topic = "energie";

  const reply = buildPrediction(topic);
  state.lastPrediction = reply;
  setTimeout(() => addBubble(reply, "bot"), 420);
}

$("#chat-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = $("#chat-input");
  handleUserText(input.value);
  input.value = "";
});

$$(".quick button").forEach((b) => {
  b.addEventListener("click", () => handleUserText(b.dataset.topic));
});
