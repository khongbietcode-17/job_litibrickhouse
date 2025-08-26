// app.js

// ====== CONFIG ======
let config = {
  text: "HAPPY|BIRTHDAY|DEAR",
  delay: 3,
  color: "#ff69b4",
  audio: "",
  name: "Your Name"
};

// ====== DOM ======
const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");
const countdownEl = document.getElementById("countdown");
const happyEl = document.getElementById("happy");
const nameEl = document.getElementById("name");
const playBtn = document.getElementById("playBtn");
const settingsBtn = document.getElementById("settingsBtn");
const shareBtn = document.getElementById("shareBtn");
const modal = document.getElementById("modal");
const closeCfg = document.getElementById("closeCfg");
const saveCfg = document.getElementById("saveCfg");
const cfgText = document.getElementById("cfgText");
const cfgDelay = document.getElementById("cfgDelay");
const cfgColor = document.getElementById("cfgColor");
const cfgAudio = document.getElementById("cfgAudio");
const bgAudio = document.getElementById("bgAudio");

// ====== MATRIX EFFECT ======
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const letters = "HAPPYBIRTHDAY".split("");
const fontSize = 14;
const columns = canvas.width / fontSize;
const drops = Array(Math.floor(columns)).fill(1);

function drawMatrix() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = config.color;
  ctx.font = fontSize + "px monospace";
  for (let i = 0; i < drops.length; i++) {
    const text = letters[Math.floor(Math.random() * letters.length)];
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  }
}
setInterval(drawMatrix, 33);

// ====== COUNTDOWN + SHOW ======
function startShow() {
  let count = config.delay;
  countdownEl.classList.remove("hidden");
  countdownEl.textContent = count;

  const timer = setInterval(() => {
    count--;
    if (count <= 0) {
      clearInterval(timer);
      countdownEl.classList.add("hidden");

      // Hiện message
      document.getElementById("message").classList.remove("hidden");

      const parts = config.text.split("|");
      happyEl.textContent = parts[0] || "HAPPY BIRTHDAY!";
      nameEl.textContent = config.name || parts[1] || "Your Name";
    } else {
      countdownEl.textContent = count;
    }
  }, 1000);

  // Nhạc nền
  if (config.audio) {
    bgAudio.src = config.audio;
    bgAudio.play();
  }
}

// ====== CONFIG SAVE/LOAD ======
function loadConfigFromURL() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("text")) config.text = params.get("text");
  if (params.get("delay")) config.delay = parseInt(params.get("delay"));
  if (params.get("color")) config.color = params.get("color");
  if (params.get("audio")) config.audio = params.get("audio");
  if (params.get("name")) config.name = params.get("name");
}
loadConfigFromURL();

function saveConfigToUI() {
  cfgText.value = config.text;
  cfgDelay.value = config.delay;
  cfgColor.value = config.color;
  cfgAudio.value = config.audio;
}
saveConfigToUI();

// ====== EVENT ======
playBtn.addEventListener("click", startShow);

settingsBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

closeCfg.addEventListener("click", () => {
  modal.classList.add("hidden");
});

saveCfg.addEventListener("click", () => {
  config.text = cfgText.value || config.text;
  config.delay = parseInt(cfgDelay.value);
  config.color = cfgColor.value;
  config.audio = cfgAudio.value;
  modal.classList.add("hidden");
});

shareBtn.addEventListener("click", async () => {
  const shareUrl = window.location.href; // Lấy URL hiện tại

  if (navigator.share) {
    // Web Share API (chạy trên mobile)
    try {
      await navigator.share({
        title: "Happy Birthday!",
        text: "Chúc bạn Happy Birthday!",
        url: shareUrl
      });
      console.log("Chia sẻ thành công");
    } catch (err) {
      console.error("Chia sẻ thất bại:", err);
    }
  } else {
    // Desktop: copy link vào clipboard
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        alert("Link đã được sao chép: " + shareUrl);
      })
      .catch(err => {
        console.error("Không thể sao chép link:", err);
      });
  }
});