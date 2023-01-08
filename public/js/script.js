const productCards = document.querySelectorAll(".productIndexCard");

productCards.forEach((card) => {
    card.addEventListener("mouseover", (e) => (e.target.style.cursor = "pointer"));
    card.addEventListener("click", (e) => {
        const productPath = card.getAttribute("data-path");
        window.location = `products/${productPath}`;
    });
});
