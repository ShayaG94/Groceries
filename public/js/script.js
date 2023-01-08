const productCards = document.querySelectorAll(".productIndexCard");
const categoriesLinks = document.querySelectorAll(".productIndexCard a");

productCards.forEach((card) => {
    card.addEventListener("mouseover", function (e) {
        e.target.style.cursor = "pointer";
        this.childNodes[1].childNodes[1].style.textDecoration = "underline";
    });
    card.addEventListener("mouseout", function (e) {
        this.childNodes[1].childNodes[1].style.textDecoration = "";
    });
    card.addEventListener("click", (e) => {
        const productPath = card.getAttribute("data-path");
        window.location = `products/${productPath}`;
    });
});

categoriesLinks.forEach((link) => {
    link.addEventListener("mouseover", function (e) {
        this.parentNode.parentNode.parentNode.childNodes[1].childNodes[1].style.textDecoration = "";
        e.stopPropagation();
    });
});
