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
