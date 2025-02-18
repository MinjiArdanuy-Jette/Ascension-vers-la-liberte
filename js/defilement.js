// Script pour le défilement des éléments
function verifierContenuVisible() {
  let recs = document.querySelectorAll(".contenu-rec");
  recs.forEach(rendreVisibleContenu);
}

function rendreVisibleContenu(rec) {
  let position = rec.getBoundingClientRect().top;
  let windowHeight = window.innerHeight;

  if (position < windowHeight - 100 && position > -rec.offsetHeight) {
    rec.classList.add("visible");
  } else {
    rec.classList.remove("visible");
  }
}

window.addEventListener("scroll", verifierContenuVisible);

const heureFond = document.getElementById("heureFond");
const maxMinutes = 12 * 60 + 12; // 12h12 en minutes (732 minutes)

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  // Progression de 0 à 1 sur tout le scroll
  const progression = Math.min(scrollY / maxScroll, 1);

  // Calcule le temps en minutes sur la base de la progression
  const minutesActuelles = Math.floor(progression * maxMinutes);
  const heures = Math.floor(minutesActuelles / 60);
  const minutes = minutesActuelles % 60;

  const heuresFormatees = heures.toString().padStart(2, "0");
  const minutesFormatees = minutes.toString().padStart(2, "0");

  heureFond.textContent = `${heuresFormatees}:${minutesFormatees}`;
});
