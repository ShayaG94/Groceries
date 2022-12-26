document.querySelectorAll(".productIndexCard").forEach((card) => {
    card.addEventListener("mouseover", (e) => (e.target.style.cursor = "pointer"));
});
