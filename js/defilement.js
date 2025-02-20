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
  let scrollY = window.scrollY;
  let maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  // Progression de 0 à 1 sur tout le scroll
  let progression = Math.min(scrollY / maxScroll, 1);

  // Calcule le temps en minutes sur la base de la progression
  let minutesActuelles = Math.floor(progression * maxMinutes);
  let heures = Math.floor(minutesActuelles / 60);
  let minutes = minutesActuelles % 60;

  let heuresFormatees = heures.toString().padStart(2, "0");
  let minutesFormatees = minutes.toString().padStart(2, "0");

  heureFond.textContent = `${heuresFormatees}:${minutesFormatees}`;
});

//Faire apparaitre le texte lettre par lettre au défilement
document.addEventListener("DOMContentLoaded", function () {
  let titres = document.querySelectorAll(".revelation-texte h2");

  // Préparation : découper chaque lettre de chaque titre
  titres.forEach((titre) => {
    let texte = titre.dataset.texte;
    titre.innerHTML = ""; // Vider le contenu actuel

    texte.split("").forEach((lettre) => {
      let span = document.createElement("span");
      span.textContent = lettre === " " ? "\u00A0" : lettre; // Gérer les espaces
      span.classList.add("lettre");
      titre.appendChild(span);
    });

    titre.dataset.revele = "false"; // Marqueur pour suivre l'état d'apparition
    titre.dataset.letterIndex = 0; // Pour suivre la progression des lettres
  });

  // Fonction pour révéler les lettres d'un h2
  function revelerLettre(titre) {
    let spans = titre.querySelectorAll("span");
    let lettreIndex = parseInt(titre.dataset.letterIndex);

    // Calculer la vitesse d'apparition (plus le titre est long, plus il faut de temps pour tout afficher)
    let delay = Math.max(40, 1000 / spans.length); // Plus le texte est long, plus le délai est long

    if (lettreIndex < spans.length) {
      spans[lettreIndex].classList.add("visible");
      titre.dataset.letterIndex = lettreIndex + 1; // Incrémenter l'index de la lettre
    } else {
      titre.dataset.revele = "true"; // Marquer le titre comme révélé
    }
  }

  // Fonction pour gérer le scroll et la progression de l'apparition
  document.addEventListener("scroll", function () {
    let windowHeight = window.innerHeight;

    titres.forEach((titre, index) => {
      let rect = titre.getBoundingClientRect();

      // Si le titre est visible et n'a pas encore été révélé
      if (
        rect.top < windowHeight * 0.5 && // Déclencher dès que l'élément est à moitié visible
        titre.dataset.revele === "false"
      ) {
        // Lancer l'animation de ce titre
        revelerLettre(titre);
      }
    });
  });
});
